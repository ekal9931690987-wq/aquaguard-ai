// ======================================================
// AQUAGUARD AI - FRONTEND SCRIPT
// ======================================================


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let map;

let mapMarkers = [];

let dashboardReportsData = [];

let currentLocationMarker = null;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("AquaGuard AI frontend loaded.");

    loadDashboard();

    loadReports();

    loadAnalytics();

    loadAdvancedAnalytics();

    initializeMap();

    setupDashboardFilters();

});


// ======================================================
// REPORT FORM
// ======================================================

const reportForm =
    document.getElementById("reportForm");


if (reportForm) {

    reportForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const message =
                document.getElementById(
                    "reportMessage"
                );

            const submitButton =
                reportForm.querySelector(
                    'button[type="submit"]'
                );


            try {

                submitButton.disabled = true;

                submitButton.innerText =
                    "Submitting...";


                const formData =
                    new FormData(reportForm);


                const response =
                    await fetch(
                        "/api/reports",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to submit report."
                    );

                }


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                let html = `

                    <div class="success-box">

                        <h3>
                            ✅ Report Submitted Successfully
                        </h3>

                        <p>
                            Your water issue has been
                            successfully reported.
                        </p>

                    </div>

                `;


                // ==================================
                // AI ANALYSIS
                // ==================================

                if (data.report) {

                    const report =
                        data.report;


                    html += `

                        <div class="ai-result-box">

                            <h3>
                                🤖 AI Analysis
                            </h3>

                            <p>
                                <strong>
                                    Category:
                                </strong>
                                ${escapeHTML(
                                    report.aiCategory ||
                                    "Unknown"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Confidence:
                                </strong>
                                ${Math.round(
                                    Number(
                                        report.aiConfidence || 0
                                    ) * 100
                                )}%
                            </p>

                            <p>
                                <strong>
                                    Severity:
                                </strong>
                                ${escapeHTML(
                                    report.severity ||
                                    "Unknown"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Duplicate:
                                </strong>

                                ${
                                    report.isDuplicate
                                    ? "⚠️ Possible duplicate found"
                                    : "✅ No duplicate found"
                                }

                            </p>

                        </div>

                    `;


                    // ==================================
                    // IMAGE ANALYSIS
                    // ==================================

                    if (report.imageAnalysis) {

                        const image =
                            report.imageAnalysis;


                        html += `

                            <div class="ai-result-box">

                                <h3>
                                    🖼️ AI Image Analysis
                                </h3>

                                <p>

                                    <strong>
                                        Detected:
                                    </strong>

                                    ${
                                        image.detected
                                        ? "✅ Yes"
                                        : "❌ No"
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Category:
                                    </strong>

                                    ${escapeHTML(
                                        image.category ||
                                        "Unknown"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Severity:
                                    </strong>

                                    ${escapeHTML(
                                        image.severity ||
                                        "Unknown"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Confidence:
                                    </strong>

                                    ${Math.round(
                                        Number(
                                            image.confidence || 0
                                        ) * 100
                                    )}%

                                </p>


                                <p>

                                    <strong>
                                        AI Message:
                                    </strong>

                                    ${escapeHTML(
                                        image.message ||
                                        "Image analyzed."
                                    )}

                                </p>

                            </div>

                        `;

                    }

                }


                message.innerHTML =
                    html;


                reportForm.reset();


                // Reload everything

                await loadDashboard();

                await loadReports();

                await loadAnalytics();

                await loadAdvancedAnalytics();


            }

            catch (error) {

                console.error(
                    "REPORT ERROR:",
                    error
                );


                message.innerHTML = `

                    <div class="error-box">

                        ❌ ${escapeHTML(
                            error.message ||
                            "Something went wrong."
                        )}

                    </div>

                `;

            }

            finally {

                submitButton.disabled = false;

                submitButton.innerText =
                    "Submit Water Issue";

            }

        }
    );

}


// ======================================================
// LOAD ALL REPORTS
// ======================================================

async function loadReports() {

    try {

        const response =
            await fetch(
                "/api/reports"
            );


        const data =
            await response.json();


        const reports =
            data.reports || [];


        renderMapReports(
            reports
        );


        updateMapMarkers(
            reports
        );


    }

    catch (error) {

        console.error(
            "LOAD REPORTS ERROR:",
            error
        );

    }

}


// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {

    try {

        await loadReports();

        await loadAnalytics();

        await loadAdvancedAnalytics();

        await loadDashboardReports();

    }

    catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );

    }

}


// ======================================================
// LOAD DASHBOARD REPORTS
// ======================================================

async function loadDashboardReports() {

    try {

        const response =
            await fetch(
                "/api/reports"
            );


        const data =
            await response.json();


        dashboardReportsData =
            data.reports || [];


        renderDashboardReports(
            dashboardReportsData
        );


    }

    catch (error) {

        console.error(
            "DASHBOARD REPORTS ERROR:",
            error
        );

        const container =
            document.getElementById(
                "dashboardReports"
            );


        if (container) {

            container.innerHTML = `

                <div class="error-box">

                    ❌ Unable to load reports.

                </div>

            `;

        }

    }

}


// ======================================================
// RENDER DASHBOARD REPORTS
// ======================================================

function renderDashboardReports(
    reports
) {

    const container =
        document.getElementById(
            "dashboardReports"
        );


    if (!container) {

        return;

    }


    if (!reports.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No Reports Found
                </h3>

                <p>
                    No incidents match the selected filters.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        reports.map(
            report => {

                const severity =
                    report.severity ||
                    "Medium";


                const status =
                    report.status ||
                    "Reported";


                const aiCategory =
                    report.aiCategory ||
                    report.issueType ||
                    "Unknown";


                const confidence =
                    Math.round(
                        Number(
                            report.aiConfidence || 0
                        ) * 100
                    );


                const image =
                    report.imageAnalysis;


                const createdAt =
                    report.createdAt
                    ? new Date(
                        report.createdAt
                    ).toLocaleString()
                    : "Unknown";


                return `

                    <div
                        class="dashboard-report-card"
                    >

                        <div
                            class="report-card-header"
                        >

                            <div>

                                <h3>
                                    💧
                                    ${escapeHTML(
                                        report.issueType ||
                                        aiCategory
                                    )}
                                </h3>

                                <p>
                                    Report ID:
                                    <strong>
                                        ${escapeHTML(
                                            String(
                                                report.id ||
                                                "N/A"
                                            )
                                        )}
                                    </strong>
                                </p>

                            </div>


                            <div>

                                <span
                                    class="severity-badge ${getSeverityClass(
                                        severity
                                    )}"
                                >
                                    ${escapeHTML(
                                        severity
                                    )}
                                </span>


                                <span
                                    class="status-badge"
                                >
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>

                            </div>

                        </div>



                        <div
                            class="report-card-body"
                        >

                            <p>

                                <strong>
                                    👤 Citizen:
                                </strong>

                                ${escapeHTML(
                                    report.name ||
                                    "Anonymous"
                                )}

                            </p>


                            ${
                                report.phone
                                ? `

                                    <p>

                                        <strong>
                                            📞 Phone:
                                        </strong>

                                        ${escapeHTML(
                                            report.phone
                                        )}

                                    </p>

                                `
                                : ""
                            }


                            ${
                                report.email
                                ? `

                                    <p>

                                        <strong>
                                            ✉️ Email:
                                        </strong>

                                        ${escapeHTML(
                                            report.email
                                        )}

                                    </p>

                                `
                                : ""
                            }


                            <p>

                                <strong>
                                    📍 Location:
                                </strong>

                                ${escapeHTML(
                                    report.location ||
                                    "Unknown"
                                )}

                            </p>


                            <p>

                                <strong>
                                    📝 Description:
                                </strong>

                                ${escapeHTML(
                                    report.description ||
                                    "No description"
                                )}

                            </p>


                            <p>

                                <strong>
                                    🕒 Reported:
                                </strong>

                                ${escapeHTML(
                                    createdAt
                                )}

                            </p>


                            ${
                                report.assignedTo
                                ? `

                                    <p>

                                        <strong>
                                            👷 Assigned To:
                                        </strong>

                                        ${escapeHTML(
                                            report.assignedTo
                                        )}

                                    </p>

                                `
                                : ""
                            }


                            ${
                                report.photo
                                ? `

                                    <div
                                        class="report-photo"
                                    >

                                        <img
                                            src="${escapeAttribute(
                                                report.photo
                                            )}"
                                            alt="Water issue"
                                            loading="lazy"
                                        >

                                    </div>

                                `
                                : ""
                            }

                        </div>



                        <!-- AI ANALYSIS -->

                        <div
                            class="report-ai-box"
                        >

                            <h4>
                                🤖 AI Analysis
                            </h4>


                            <p>

                                <strong>
                                    Category:
                                </strong>

                                ${escapeHTML(
                                    aiCategory
                                )}

                            </p>


                            <p>

                                <strong>
                                    Confidence:
                                </strong>

                                ${confidence}%

                            </p>


                            <p>

                                <strong>
                                    Severity:
                                </strong>

                                ${escapeHTML(
                                    severity
                                )}

                            </p>


                            <p>

                                <strong>
                                    Duplicate:
                                </strong>

                                ${
                                    report.isDuplicate
                                    ? `⚠️ Yes — linked to Report ${escapeHTML(
                                        String(
                                            report.duplicateReportId ||
                                            ""
                                        )
                                    )}`
                                    : "✅ No duplicate found"
                                }

                            </p>

                        </div>



                        ${
                            image
                            ? `

                                <div
                                    class="report-ai-box"
                                >

                                    <h4>
                                        🖼️ AI Image Analysis
                                    </h4>


                                    <p>

                                        <strong>
                                            Detected:
                                        </strong>

                                        ${
                                            image.detected
                                            ? "✅ Yes"
                                            : "❌ No"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Category:
                                        </strong>

                                        ${escapeHTML(
                                            image.category ||
                                            "Unknown"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Severity:
                                        </strong>

                                        ${escapeHTML(
                                            image.severity ||
                                            "Unknown"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Confidence:
                                        </strong>

                                        ${Math.round(
                                            Number(
                                                image.confidence ||
                                                0
                                            ) * 100
                                        )}%

                                    </p>


                                    <p>

                                        <strong>
                                            AI Message:
                                        </strong>

                                        ${escapeHTML(
                                            image.message ||
                                            "No message"
                                        )}

                                    </p>

                                </div>

                            `
                            : ""
                        }



                        <!-- STATUS TIMELINE -->

                        <div
                            class="status-timeline"
                        >

                            ${renderStatusTimeline(
                                status
                            )}

                        </div>



                        <!-- ACTION BUTTONS -->

                        <div
                            class="report-actions"
                        >

                            <button
                                class="btn secondary"
                                onclick="assignReport('${escapeAttribute(
                                    String(
                                        report.id
                                    )
                                )}')"
                            >
                                👷 Assign
                            </button>


                            <button
                                class="btn secondary"
                                onclick="updateStatus('${escapeAttribute(
                                    String(
                                        report.id
                                    )
                                )}', 'In Progress')"
                            >
                                🔧 In Progress
                            </button>


                            <button
                                class="btn primary"
                                onclick="updateStatus('${escapeAttribute(
                                    String(
                                        report.id
                                    )
                                )}', 'Resolved')"
                            >
                                ✅ Resolve
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ======================================================
// STATUS TIMELINE
// ======================================================

function renderStatusTimeline(
    currentStatus
) {

    const statuses = [
        "Reported",
        "Assigned",
        "In Progress",
        "Resolved"
    ];


    const currentIndex =
        statuses.indexOf(
            currentStatus
        );


    return statuses.map(
        (status, index) => {

            const active =
                index <= currentIndex
                ? "active"
                : "";


            return `

                <div
                    class="timeline-step ${active}"
                >

                    <div
                        class="timeline-number"
                    >
                        ${index + 1}
                    </div>

                    <span>
                        ${status}
                    </span>

                </div>

            `;

        }
    ).join("");

}


// ======================================================
// ANALYTICS
// ======================================================

async function loadAnalytics() {

    try {

        const response =
            await fetch(
                "/api/analytics"
            );


        if (!response.ok) {

            throw new Error(
                "Analytics API failed"
            );

        }


        const data =
            await response.json();


        const totalReports =
            document.getElementById(
                "totalReports"
            );


        const criticalReports =
            document.getElementById(
                "criticalReports"
            );


        const progressReports =
            document.getElementById(
                "progressReports"
            );


        const resolvedReports =
            document.getElementById(
                "resolvedReports"
            );


        if (totalReports) {

            totalReports.innerText =
                data.totalReports ??
                data.total ??
                0;

        }


        if (criticalReports) {

            criticalReports.innerText =
                data.criticalReports ??
                data.critical ??
                0;

        }


        if (progressReports) {

            progressReports.innerText =
                data.progressReports ??
                data.inProgress ??
                0;

        }


        if (resolvedReports) {

            resolvedReports.innerText =
                data.resolvedReports ??
                data.resolved ??
                0;

        }

    }

    catch (error) {

        console.error(
            "ANALYTICS ERROR:",
            error
        );

    }

}


// ======================================================
// ADVANCED ANALYTICS
// ======================================================

async function loadAdvancedAnalytics() {

    try {

        const response =
            await fetch(
                "/api/reports"
            );


        const data =
            await response.json();


        const reports =
            data.reports || [];


        // ==================================
        // SEVERITY
        // ==================================

        const severityCounts = {

            Critical: 0,

            High: 0,

            Medium: 0,

            Low: 0

        };


        // ==================================
        // ISSUE TYPES
        // ==================================

        const issueCounts = {};


        // ==================================
        // STATUS
        // ==================================

        const statusCounts = {

            Reported: 0,

            Assigned: 0,

            "In Progress": 0,

            Resolved: 0

        };


        reports.forEach(
            report => {

                const severity =
                    report.severity ||
                    "Medium";


                const issue =
                    report.aiCategory ||
                    report.issueType ||
                    "Other";


                const status =
                    report.status ||
                    "Reported";


                if (
                    severityCounts[
                        severity
                    ] !== undefined
                ) {

                    severityCounts[
                        severity
                    ]++;

                }


                issueCounts[
                    issue
                ] =
                    (
                        issueCounts[
                            issue
                        ] || 0
                    ) + 1;


                if (
                    statusCounts[
                        status
                    ] !== undefined
                ) {

                    statusCounts[
                        status
                    ]++;

                }

            }
        );


        // ==================================
        // SEVERITY HTML
        // ==================================

        const severityContainer =
            document.getElementById(
                "severityAnalytics"
            );


        if (severityContainer) {

            severityContainer.innerHTML = `

                <div class="analytics-list">

                    <div>
                        🔴 Critical
                        <strong>
                            ${severityCounts.Critical}
                        </strong>
                    </div>

                    <div>
                        🟠 High
                        <strong>
                            ${severityCounts.High}
                        </strong>
                    </div>

                    <div>
                        🟡 Medium
                        <strong>
                            ${severityCounts.Medium}
                        </strong>
                    </div>

                    <div>
                        🟢 Low
                        <strong>
                            ${severityCounts.Low}
                        </strong>
                    </div>

                </div>

            `;

        }


        // ==================================
        // ISSUE HTML
        // ==================================

        const issueContainer =
            document.getElementById(
                "issueAnalytics"
            );


        if (issueContainer) {

            const entries =
                Object.entries(
                    issueCounts
                );


            if (!entries.length) {

                issueContainer.innerHTML =
                    "<p>No reports yet.</p>";

            }

            else {

                issueContainer.innerHTML = `

                    <div class="analytics-list">

                        ${entries.map(
                            ([issue, count]) => `

                                <div>

                                    ${escapeHTML(
                                        issue
                                    )}

                                    <strong>
                                        ${count}
                                    </strong>

                                </div>

                            `
                        ).join("")}

                    </div>

                `;

            }

        }


        // ==================================
        // STATUS ANALYTICS CARD
        // ==================================

        let statusContainer =
            document.getElementById(
                "statusAnalytics"
            );


        if (!statusContainer) {

            const analyticsSection =
                document.querySelector(
                    ".analytics-section"
                );


            if (analyticsSection) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "analytics-card";


                card.innerHTML = `

                    <h3>
                        📌 Status Statistics
                    </h3>

                    <div
                        id="statusAnalytics"
                    ></div>

                `;


                analyticsSection.appendChild(
                    card
                );


                statusContainer =
                    document.getElementById(
                        "statusAnalytics"
                    );

            }

        }


        if (statusContainer) {

            statusContainer.innerHTML = `

                <div class="analytics-list">

                    <div>
                        📝 Reported
                        <strong>
                            ${statusCounts.Reported}
                        </strong>
                    </div>

                    <div>
                        👷 Assigned
                        <strong>
                            ${statusCounts.Assigned}
                        </strong>
                    </div>

                    <div>
                        🔧 In Progress
                        <strong>
                            ${statusCounts["In Progress"]}
                        </strong>
                    </div>

                    <div>
                        ✅ Resolved
                        <strong>
                            ${statusCounts.Resolved}
                        </strong>
                    </div>

                </div>

            `;

        }

    }

    catch (error) {

        console.error(
            "ADVANCED ANALYTICS ERROR:",
            error
        );

    }

}


// ======================================================
// SEARCH + FILTER SETUP
// ======================================================

function setupDashboardFilters() {

    const search =
        document.getElementById(
            "reportSearch"
        );


    const issueFilter =
        document.getElementById(
            "issueFilter"
        );


    const severityFilter =
        document.getElementById(
            "severityFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const clearButton =
        document.getElementById(
            "clearFilters"
        );


    if (search) {

        search.addEventListener(
            "input",
            filterDashboardReports
        );

    }


    if (issueFilter) {

        issueFilter.addEventListener(
            "change",
            filterDashboardReports
        );

    }


    if (severityFilter) {

        severityFilter.addEventListener(
            "change",
            filterDashboardReports
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterDashboardReports
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            resetDashboardFilters
        );

    }

}


// ======================================================
// FILTER DASHBOARD REPORTS
// ======================================================

function filterDashboardReports() {

    const searchInput =
        document.getElementById(
            "reportSearch"
        );


    const issueFilter =
        document.getElementById(
            "issueFilter"
        );


    const severityFilter =
        document.getElementById(
            "severityFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchText =
        (
            searchInput
            ? searchInput.value
            : ""
        )
        .toLowerCase()
        .trim();


    const selectedIssue =
        issueFilter
        ? issueFilter.value
        : "all";


    const selectedSeverity =
        severityFilter
        ? severityFilter.value
        : "all";


    const selectedStatus =
        statusFilter
        ? statusFilter.value
        : "all";


    const filteredReports =
        dashboardReportsData.filter(
            report => {

                const reportText = `

                    ${report.id || ""}

                    ${report.name || ""}

                    ${report.phone || ""}

                    ${report.location || ""}

                    ${report.description || ""}

                    ${report.issueType || ""}

                    ${report.aiCategory || ""}

                `.toLowerCase();


                const issue =
                    report.aiCategory ||
                    report.issueType ||
                    "Other";


                const severity =
                    report.severity ||
                    "Medium";


                const status =
                    report.status ||
                    "Reported";


                const matchesSearch =
                    !searchText ||
                    reportText.includes(
                        searchText
                    );


                const matchesIssue =
                    selectedIssue === "all" ||
                    issue === selectedIssue ||
                    report.issueType ===
                        selectedIssue;


                const matchesSeverity =
                    selectedSeverity === "all" ||
                    severity ===
                        selectedSeverity;


                const matchesStatus =
                    selectedStatus === "all" ||
                    status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesIssue &&
                    matchesSeverity &&
                    matchesStatus
                );

            }
        );


    renderDashboardReports(
        filteredReports
    );

}


// ======================================================
// RESET FILTERS
// ======================================================

function resetDashboardFilters() {

    const search =
        document.getElementById(
            "reportSearch"
        );


    const issue =
        document.getElementById(
            "issueFilter"
        );


    const severity =
        document.getElementById(
            "severityFilter"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {

        search.value = "";

    }


    if (issue) {

        issue.value = "all";

    }


    if (severity) {

        severity.value = "all";

    }


    if (status) {

        status.value = "all";

    }


    renderDashboardReports(
        dashboardReportsData
    );

}


// ======================================================
// UPDATE STATUS
// ======================================================

async function updateStatus(
    reportId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `/api/reports/${encodeURIComponent(
                    reportId
                )}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Status update failed."
            );

        }


        alert(
            `Report status updated to ${newStatus}`
        );


        await loadDashboard();

        await loadReports();

    }

    catch (error) {

        console.error(
            "STATUS UPDATE ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to update status."
        );

    }

}


// ======================================================
// ASSIGN REPORT
// ======================================================

async function assignReport(
    reportId
) {

    const person =
        prompt(
            "Enter authority/team name:"
        );


    if (!person) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/reports/${encodeURIComponent(
                    reportId
                )}/assign`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        assignedTo:
                            person
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Assignment failed."
            );

        }


        alert(
            "Report assigned successfully."
        );


        await loadDashboard();

        await loadReports();

    }

    catch (error) {

        console.error(
            "ASSIGN ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to assign report."
        );

    }

}


// ======================================================
// CREATE DEMO REPORT
// ======================================================

async function createDemoReport() {

    try {

        const response =
            await fetch(
                "/api/demo-report",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Demo report creation failed."
            );

        }


        alert(
            "✅ Demo incident created successfully."
        );


        await loadDashboard();

        await loadReports();

        await loadAnalytics();

        await loadAdvancedAnalytics();

    }

    catch (error) {

        console.error(
            "DEMO REPORT ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to create demo report."
        );

    }

}


// ======================================================
// MAP INITIALIZATION
// ======================================================

function initializeMap() {

    const mapElement =
        document.getElementById(
            "waterMap"
        );


    if (!mapElement) {

        return;

    }


    try {

        map =
            L.map(
                "waterMap"
            ).setView(
                [
                    28.4744,
                    77.5040
                ],
                11
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);


        console.log(
            "Map initialized."
        );


    }

    catch (error) {

        console.error(
            "MAP ERROR:",
            error
        );

    }

}


// ======================================================
// UPDATE MAP MARKERS
// ======================================================

function updateMapMarkers(
    reports
) {

    if (!map) {

        return;

    }


    // Remove old markers

    mapMarkers.forEach(
        marker => {

            map.removeLayer(
                marker
            );

        }
    );


    mapMarkers = [];


    reports.forEach(
        report => {

            if (
                report.latitude == null ||
                report.longitude == null
            ) {

                return;

            }


            const lat =
                Number(
                    report.latitude
                );


            const lng =
                Number(
                    report.longitude
                );


            if (
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            ) {

                return;

            }


            const severity =
                report.severity ||
                "Medium";


            const markerColor =
                getSeverityColor(
                    severity
                );


            const marker =
                L.circleMarker(
                    [
                        lat,
                        lng
                    ],
                    {
                        radius: 9,

                        fillColor:
                            markerColor,

                        color:
                            "#ffffff",

                        weight: 2,

                        opacity: 1,

                        fillOpacity:
                            0.85
                    }
                ).addTo(map);


            marker.bindPopup(`

                <div>

                    <h3>
                        💧 ${escapeHTML(
                            report.issueType ||
                            "Water Issue"
                        )}
                    </h3>

                    <p>
                        <strong>
                            Report:
                        </strong>
                        ${escapeHTML(
                            String(
                                report.id ||
                                "N/A"
                            )
                        )}
                    </p>

                    <p>
                        <strong>
                            Location:
                        </strong>
                        ${escapeHTML(
                            report.location ||
                            "Unknown"
                        )}
                    </p>

                    <p>
                        <strong>
                            Severity:
                        </strong>
                        ${escapeHTML(
                            severity
                        )}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>
                        ${escapeHTML(
                            report.status ||
                            "Reported"
                        )}
                    </p>

                    <p>
                        <strong>
                            AI Category:
                        </strong>
                        ${escapeHTML(
                            report.aiCategory ||
                            "Unknown"
                        )}
                    </p>

                </div>

            `);


            mapMarkers.push(
                marker
            );

        }
    );

}


// ======================================================
// MAP REPORT LIST
// ======================================================

function renderMapReports(
    reports
) {

    const container =
        document.getElementById(
            "mapReports"
        );


    if (!container) {

        return;

    }


    if (!reports.length) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    No water issues reported yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        reports.map(
            report => `

                <div
                    class="map-report-card"
                >

                    <h3>
                        💧 ${escapeHTML(
                            report.issueType ||
                            report.aiCategory ||
                            "Water Issue"
                        )}
                    </h3>


                    <p>

                        📍

                        ${escapeHTML(
                            report.location ||
                            "Unknown"
                        )}

                    </p>


                    <p>

                        Severity:

                        <strong>
                            ${escapeHTML(
                                report.severity ||
                                "Medium"
                            )}
                        </strong>

                    </p>


                    <p>

                        Status:

                        <strong>
                            ${escapeHTML(
                                report.status ||
                                "Reported"
                            )}
                        </strong>

                    </p>

                </div>

            `
        ).join("");

}


// ======================================================
// USER LOCATION
// ======================================================

function getUserLocation() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Geolocation is not supported by this browser."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            const latitudeInput =
                document.getElementById(
                    "latitude"
                );


            const longitudeInput =
                document.getElementById(
                    "longitude"
                );


            if (latitudeInput) {

                latitudeInput.value =
                    latitude;

            }


            if (longitudeInput) {

                longitudeInput.value =
                    longitude;

            }


            console.log(
                "User location:",
                latitude,
                longitude
            );


            reverseGeocode(
                latitude,
                longitude
            );


            if (map) {

                map.setView(
                    [
                        latitude,
                        longitude
                    ],
                    15
                );


                if (
                    currentLocationMarker
                ) {

                    map.removeLayer(
                        currentLocationMarker
                    );

                }


                currentLocationMarker =
                    L.marker(
                        [
                            latitude,
                            longitude
                        ]
                    )
                    .addTo(map)
                    .bindPopup(
                        "📍 Your Location"
                    )
                    .openPopup();

            }

        },


        function (error) {

            console.error(
                "LOCATION ERROR:",
                error
            );


            alert(
                "Unable to get your location. Please allow location permission."
            );

        },

        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0
        }

    );

}


// ======================================================
// USE MY LOCATION
// ======================================================

function useMyLocation() {

    getUserLocation();

}


// ======================================================
// REVERSE GEOCODING
// ======================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
                    latitude
                )}&lon=${encodeURIComponent(
                    longitude
                )}`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        const locationInput =
            document.getElementById(
                "location"
            );


        if (
            locationInput &&
            data.display_name
        ) {

            locationInput.value =
                data.display_name;

        }

    }

    catch (error) {

        console.error(
            "REVERSE GEOCODING ERROR:",
            error
        );

    }

}


// ======================================================
// LOCATION TEXT → COORDINATES
// ======================================================

const locationInput =
    document.getElementById(
        "location"
    );


if (locationInput) {

    locationInput.addEventListener(
        "change",
        async function () {

            const location =
                this.value.trim();


            if (!location) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                            location
                        )}&limit=1`,
                        {
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                const data =
                    await response.json();


                if (
                    data &&
                    data.length > 0
                ) {

                    const latitude =
                        data[0].lat;


                    const longitude =
                        data[0].lon;


                    const latitudeInput =
                        document.getElementById(
                            "latitude"
                        );


                    const longitudeInput =
                        document.getElementById(
                            "longitude"
                        );


                    if (latitudeInput) {

                        latitudeInput.value =
                            latitude;

                    }


                    if (longitudeInput) {

                        longitudeInput.value =
                            longitude;

                    }


                    if (map) {

                        map.setView(
                            [
                                Number(
                                    latitude
                                ),
                                Number(
                                    longitude
                                )
                            ],
                            14
                        );

                    }

                }

            }

            catch (error) {

                console.error(
                    "LOCATION SEARCH ERROR:",
                    error
                );

            }

        }
    );

}


// ======================================================
// SEVERITY COLOR
// ======================================================

function getSeverityColor(
    severity
) {

    switch (
        String(
            severity
        ).toLowerCase()
    ) {

        case "critical":
            return "#ff1744";

        case "high":
            return "#ff9800";

        case "medium":
            return "#ffc107";

        case "low":
            return "#4caf50";

        default:
            return "#2196f3";

    }

}


// ======================================================
// SEVERITY CSS CLASS
// ======================================================

function getSeverityClass(
    severity
) {

    switch (
        String(
            severity
        ).toLowerCase()
    ) {

        case "critical":
            return "severity-critical";

        case "high":
            return "severity-high";

        case "medium":
            return "severity-medium";

        case "low":
            return "severity-low";

        default:
            return "severity-medium";

    }

}


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ======================================================
// ATTRIBUTE SECURITY
// ======================================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
    async function () {

        console.log(
            "Refreshing AquaGuard data..."
        );


        await loadAnalytics();

        await loadAdvancedAnalytics();

        await loadDashboardReports();

        await loadReports();

    },
    30000
);


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.loadDashboard =
    loadDashboard;


window.loadReports =
    loadReports;


window.loadAnalytics =
    loadAnalytics;


window.loadAdvancedAnalytics =
    loadAdvancedAnalytics;


window.loadDashboardReports =
    loadDashboardReports;


window.filterDashboardReports =
    filterDashboardReports;


window.resetDashboardFilters =
    resetDashboardFilters;


window.updateStatus =
    updateStatus;


window.assignReport =
    assignReport;


window.createDemoReport =
    createDemoReport;


window.useMyLocation =
    useMyLocation;


window.getUserLocation =
    getUserLocation;


// ======================================================
// END
// ======================================================

console.log(
    "AquaGuard AI script.js ready."
);