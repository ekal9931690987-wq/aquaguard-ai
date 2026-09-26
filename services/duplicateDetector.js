/**
 * AquaGuard AI - Duplicate Issue Detection Engine
 * Uses Haversine geospatial proximity calculation and textual/categorical matching
 * to prevent duplicate work orders and consolidate citizen reports.
 */

// Haversine formula to compute distance in meters between two lat/lng pairs
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Checks an incoming issue against active/recent issues in the system
 * @param {Object} candidateIssue - { lat, lng, categoryId, title, description }
 * @param {Array} existingIssues - Array of issues from DB
 * @param {number} thresholdMeters - Distance threshold (default 250m)
 */
function checkForDuplicates(candidateIssue, existingIssues = [], thresholdMeters = 250) {
  const { lat, lng, categoryId, title } = candidateIssue;

  if (!lat || !lng) {
    return {
      hasDuplicate: false,
      duplicates: [],
      message: 'No geolocation provided for spatial duplicate check.'
    };
  }

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  // Filter only active or recently reported issues (Reported, Assigned, In Progress)
  const activeIssues = existingIssues.filter(issue => issue.status !== 'Resolved');

  const matches = [];

  for (const existing of activeIssues) {
    const exLat = parseFloat(existing.location?.coordinates?.lat || existing.lat);
    const exLng = parseFloat(existing.location?.coordinates?.lng || existing.lng);

    if (isNaN(exLat) || isNaN(exLng)) continue;

    const distance = getDistanceInMeters(numLat, numLng, exLat, exLng);

    // If within radius
    if (distance <= thresholdMeters) {
      const sameCategory = (existing.aiAnalysis?.categoryId === categoryId) || 
                           (existing.category === candidateIssue.category);

      // Simple text token overlap
      const candidateTokens = (title || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const existingTokens = (existing.title || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const commonWords = candidateTokens.filter(t => existingTokens.includes(t));

      let confidence = 0;
      if (sameCategory) confidence += 60;
      if (distance < 50) confidence += 30;
      else if (distance < 120) confidence += 20;
      else confidence += 10;
      if (commonWords.length > 0) confidence += 15;

      confidence = Math.min(99, confidence);

      if (confidence >= 60 || sameCategory) {
        matches.push({
          issueId: existing.ticketId || existing._id,
          title: existing.title,
          category: existing.category || existing.aiAnalysis?.category,
          status: existing.status,
          severity: existing.severity || existing.aiAnalysis?.severity,
          distanceMeters: Math.round(distance),
          reportedAt: existing.createdAt,
          address: existing.location?.address || existing.address,
          confidence: `${confidence}%`,
          upvotes: existing.upvotes || 1
        });
      }
    }
  }

  // Sort by closest distance
  matches.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const hasDuplicate = matches.length > 0;

  return {
    hasDuplicate,
    closestMatch: matches[0] || null,
    duplicates: matches,
    message: hasDuplicate
      ? `Detected ${matches.length} active issue(s) within ${thresholdMeters}m of this location!`
      : 'No spatial duplicates found within immediate proximity.'
  };
}

module.exports = {
  getDistanceInMeters,
  checkForDuplicates
};
