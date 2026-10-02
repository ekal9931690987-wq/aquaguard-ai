function classifyIssue(issueType, description) {
    const text = `${issueType} ${description}`.toLowerCase();

    let category = issueType || "Other";
    let severity = "Medium";
    let confidence = 0.80;

    if (
        text.includes("contamin") ||
        text.includes("dirty water") ||
        text.includes("sewage") ||
        text.includes("pollut")
    ) {
        category = "Water Contamination";
        severity = "Critical";
        confidence = 0.94;
    } 
    else if (text.includes("burst")) {
        category = "Pipeline Burst";
        severity = "High";
        confidence = 0.95;
    } 
    else if (text.includes("leak")) {
        category = "Pipeline Leak";
        severity = "High";
        confidence = 0.92;
    } 
    else if (text.includes("overflow")) {
        category = "Sewage Overflow";
        severity = "Critical";
        confidence = 0.92;
    } 
    else if (text.includes("manhole")) {
        category = "Open Manhole";
        severity = "High";
        confidence = 0.90;
    } 
    else if (text.includes("wast")) {
        category = "Water Wastage";
        severity = "Medium";
        confidence = 0.88;
    }

    return {
        category,
        severity,
        confidence
    };
}


function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function getWords(text) {
    return new Set(
        normalizeText(text)
            .split(" ")
            .filter(word => word.length > 2)
    );
}


function calculateSimilarity(text1, text2) {
    const words1 = getWords(text1);
    const words2 = getWords(text2);

    if (words1.size === 0 || words2.size === 0) {
        return 0;
    }

    let commonWords = 0;

    for (const word of words1) {
        if (words2.has(word)) {
            commonWords++;
        }
    }

    return commonWords / Math.max(words1.size, words2.size);
}


function checkDuplicate(newReport, existingReports) {

    const newLocation =
        normalizeText(newReport.location);

    const newDescription =
        normalizeText(newReport.description);

    for (const oldReport of existingReports) {

        const oldLocation =
            normalizeText(oldReport.location);

        const sameLocation =
            newLocation &&
            oldLocation &&
            (
                newLocation === oldLocation ||
                newLocation.includes(oldLocation) ||
                oldLocation.includes(newLocation)
            );

        const descriptionSimilarity =
            calculateSimilarity(
                newDescription,
                oldReport.description
            );

        const sameCoordinates =
            newReport.latitude &&
            newReport.longitude &&
            oldReport.latitude &&
            oldReport.longitude &&
            Math.abs(
                Number(newReport.latitude) -
                Number(oldReport.latitude)
            ) < 0.01 &&
            Math.abs(
                Number(newReport.longitude) -
                Number(oldReport.longitude)
            ) < 0.01;


        if (
            (sameLocation || sameCoordinates) &&
            descriptionSimilarity >= 0.35
        ) {

            return {
                isDuplicate: true,
                reportId: oldReport.id
            };
        }
    }

    return {
        isDuplicate: false,
        reportId: null
    };
}


module.exports = {
    classifyIssue,
    checkDuplicate
};