# 🌊 AquaGuard AI - Water & Civic Infrastructure Management Platform

AquaGuard AI is an AI-powered civic platform designed for municipal water authorities and citizens to report, triage, and resolve water and civic infrastructure issues with zero delay.

---

## 🚀 Live Server & Portals

The application server is actively running at **[http://localhost:3000](http://localhost:3000)**.

- **🏠 Citizen Home Portal:** [http://localhost:3000/#home](http://localhost:3000/#home)
- **🚨 Issue Reporting Form & AI Scanner:** [http://localhost:3000/#report](http://localhost:3000/#report)
- **🗺️ Interactive Geospatial Map:** [http://localhost:3000/#map](http://localhost:3000/#map)
- **📋 Authority / Admin Dashboard:** [http://localhost:3000/#dashboard](http://localhost:3000/#dashboard)
- **📈 Infrastructure Analytics & Hotspot Radar:** [http://localhost:3000/#analytics](http://localhost:3000/#analytics)
- **🔍 Citizen Ticket Tracker:** [http://localhost:3000/#track](http://localhost:3000/#track)

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Water-Tech Design System, Glassmorphism, Google Fonts: *Plus Jakarta Sans* & *Outfit*), Vanilla JavaScript
- **Mapping:** [Leaflet.js](https://leafletjs.com/) with CartoDB Voyager tiles and custom SVG pulsing severity pins
- **Visualizations:** [Chart.js](https://www.chartjs.org/) (Doughnut, Bar, and Line charts)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB via Mongoose with automatic fallback to persistent local JSON database (`data/aquaguard_issues.json`) so the application operates seamlessly with or without a local MongoDB service.

---

## 🧩 Key Modules Implemented

1. **Citizen Home Page:** Hero section, live issue counters, 4-stage resolution workflow explanation, recent community incident feed, and emergency hotlines.
2. **Issue Reporting Form:** Multi-step wizard with 1-click preset demo scenarios (*Pipe Burst, Sewage Overflow, Dirty Tap Water, Open Manhole, Clogged Drain*), address geocoding, landmark input, and ward selection.
3. **Photo Upload & Holographic AI Scanner:** Drag & drop zone with real-time holographic scanning animation sweep across uploaded photos.
4. **Location & GPS Picker:** Browser HTML5 Geolocation API auto-detection + embedded draggable Leaflet mini-map pin.
5. **AI-Based Issue Classification:** Natural language and image keyword analysis classifying into 8 municipal infrastructure categories with confidence scoring.
6. **Severity & Priority Detection:** Automated urgency grading (*Critical, High, Medium, Low*) with target SLA (e.g. 2h, 4h, 12h, 48h) and estimated water loss calculations.
7. **Duplicate Issue Detection:** Haversine geospatial proximity calculations detecting active reports within 250m, allowing citizens to upvote existing tickets instead of duplicating work orders.
8. **Interactive Issue Map:** Full-bleed map with color-coded severity pins, interactive case file popups, and pulsating danger zone hotspot circles.
9. **Authority / Admin Dashboard:** Municipal work orders overview, KPI metric cards, dynamic search, multi-factor filtering, and CSV export.
10. **Issue Management Table:** High-density responsive data table with single-click inspection and status modification modals.
11. **Status Lifecycle System:** 4 official workflow states:
   - `Reported` → `Assigned` → `In Progress` → `Resolved` with chronological timeline audit logging and field officer assignment.
12. **Analytics & Hotspot Section:** Chart.js visualizations for category breakdown, severity distribution, 7-day resolution trends, and ward hotspot risk leaderboards.
13. **Citizen Ticket Tracker:** Fast reference lookup by Ticket ID (e.g. `AQ-2026-1081`).

---

## 🏃‍♂️ How to Run Locally

If starting the server afresh in the terminal:

```powershell
# 1. Install dependencies (if not already done)
npm install

# 2. Start the AquaGuard AI server
node server.js
```

The server will automatically start on `http://localhost:3000`.

### Connecting to MongoDB (Optional)
To connect to an external or local MongoDB instance, provide the `MONGODB_URI` environment variable:
```powershell
$env:MONGODB_URI="mongodb://localhost:27017/aquaguard_ai"; node server.js
```
If MongoDB is not present, AquaGuard AI automatically uses its embedded JSON persistent engine in `data/aquaguard_issues.json`.
