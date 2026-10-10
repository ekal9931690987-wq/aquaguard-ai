require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const {
    classifyIssue,
    checkDuplicate
} = require("./services/aiClassifier");
const {
    analyzeImage
} = require("./services/imageAnalyzer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

 // Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing in .env");
}

app.set("trust proxy", 1);

app.use(session({
    name: "aquaguard.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 8
    }
}));

// Session configuration
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing in .env");
}

app.set("trust proxy", 1);

app.use(session({
    name: "aquaguard.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 8
    }
}));


// Folders
const publicFolder = path.join(__dirname, "public");
const dataFolder = path.join(__dirname, "data");
const uploadFolder = path.join(publicFolder, "uploads");

// Create folders
if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder, { recursive: true });
}

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Database
const databaseFile = path.join(dataFolder, "reports.json");

const usersFile = path.join(dataFolder, "users.json");

function readUsers() {
    try {
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "[]", "utf8");
        }

        const data = fs.readFileSync(usersFile, "utf8");
        const users = JSON.parse(data);

        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error("Could not read users database:", error.message);
        throw new Error("Users database could not be read.");
    }
}

function writeUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}



if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, "[]");
}

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPassword = String(password);

        if (cleanName.length < 2 || cleanName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 80 characters."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (
            Buffer.byteLength(cleanPassword, "utf8") < 8 ||
            Buffer.byteLength(cleanPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8 to 72 bytes long."
            });
        }

        const users = readUsers();

        if (users.some(user => user.email === cleanEmail)) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(cleanPassword, 12);

        const user = {
            id: require("crypto").randomUUID(),
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        writeUsers(users);

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        req.session.save((error) => {
            if (error) {
                console.error("Session save failed:", error.message);
                return res.status(500).json({
                    success: false,
                    message: "Account created, but session could not be started. Please log in."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Account created successfully.",
                user: req.session.user
            });
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Could not create account. Please try again."
        });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const users = readUsers();

        const user = users.find(
            item => item.email === cleanEmail
        );

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                console.error("Session regeneration failed:", error.message);
                return res.status(500).json({
                    success: false,
                    message: "Could not start your session."
                });
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email
            };

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save failed:", saveError.message);
                    return res.status(500).json({
                        success: false,
                        message: "Could not save your session."
                    });
                }

                return res.json({
                    success: true,
                    message: "Login successful.",
                    user: req.session.user
                });
            });
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please log in."
        });
    }

    return res.json({
        success: true,
        user: req.session.user
    });
});

function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please log in to access this resource."
        });
    }

    next();
}


app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Could not log out."
            });
        }

        res.clearCookie("aquaguard.sid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});




// Serve frontend
app.use(express.static(publicFolder));

// Serve uploaded images
app.use("/uploads", express.static(uploadFolder));

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const fileName =
            "report-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000) +
            extension;

        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                )
            );
        }
    }
});

// Read reports
function getReports() {

    try {

        const data = fs.readFileSync(
            databaseFile,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        return [];

    }
}

// Save reports
function saveReports(reports) {

    fs.writeFileSync(
        databaseFile,
        JSON.stringify(reports, null, 2)
    );

}

// Health check
app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "AquaGuard AI server is running",
        status: "online"
    });

});


app.get("/api/reports", requireAuth, (req, res) => {
    const reports = getReports();

    res.json({
        success: true,
        count: reports.length,
        reports: reports
    });
});

// Clear all reports and uploaded report photos
app.delete("/api/reports", (req, res) => {

    try {

        const adminKey = process.env.ADMIN_CLEAR_KEY;

        if (!adminKey) {
            return res.status(503).json({
                success: false,
                message: "Clear-all is not configured. Set ADMIN_CLEAR_KEY in the environment."
            });
        }

        if (req.get("x-admin-key") !== adminKey) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin key."
            });
        }

        const files = fs.readdirSync(uploadFolder);

        for (const file of files) {
            const filePath = path.join(uploadFolder, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile()) {
                fs.unlinkSync(filePath);
            }
        }

        saveReports([]);

        res.json({
            success: true,
            message: "All reports and uploaded photos were deleted."
        });

    } catch (error) {

        console.error("CLEAR REPORTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to clear reports."
        });

    }

});

// Create new report
app.post(
    "/api/reports",
    upload.single("photo"),
    (req, res) => {

        try {

            const reports = getReports();

            const {
                name,
                phone,
                email,
                issueType,
                description,
                location,
                latitude,
                longitude
            } = req.body;

            // Required fields
            if (
                !name ||
                !issueType ||
                !description ||
                !location
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill all required fields."

                });

            }

            // ==============================
            // AI CLASSIFICATION
            // ==============================

            const aiResult = classifyIssue(
                issueType,
                description
            );
            const imageResult = analyzeImage(
    req.file ? req.file.path : null,
    issueType,
    description
);

            const severity = aiResult.severity;

            const aiCategory = aiResult.category;

            const aiConfidence =
                aiResult.confidence;

            // ==============================
            // DUPLICATE DETECTION
            // ==============================

            const duplicateCheck =
                checkDuplicate(
                    {
                        issueType,
                        description,
                        location
                    },
                    reports
                );

            // ==============================
            // CREATE REPORT
            // ==============================

            const report = {

                id:
                    "AQ-" +
                    Date.now(),

                name: name,

                phone:
                    phone || "",

                email:
                    email || "",

                issueType:
                    issueType,

                description:
                    description,

                location:
                    location,

                latitude:
                    latitude || null,

                longitude:
                    longitude || null,

                // AI information
                aiCategory:
                    aiCategory,

                aiConfidence:
                    aiConfidence,
                    imageAnalysis:
                     imageResult,

                severity:
                    severity,

                // Duplicate information
                isDuplicate:
                    duplicateCheck.isDuplicate,

                duplicateReportId:
                    duplicateCheck.reportId || null,

                status:
                    "Reported",

                photo:
                    req.file
                        ? "/uploads/" +
                          req.file.filename
                        : null,

                createdAt:
                    new Date().toISOString(),

                assignedTo:
                    null,

                updatedAt:
                    new Date().toISOString()

            };

            // Save report
            reports.unshift(report);

            saveReports(reports);

            // Response
            res.status(201).json({

                success: true,

                message:
                    "Water issue reported successfully.",

                report: report

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Something went wrong while creating the report."

            });

        }

    }
);

// Update report status
app.put(
    "/api/reports/:id/status",
    (req, res) => {

        try {

            const reports = getReports();

            const report =
                reports.find(
                    item =>
                        item.id ===
                        req.params.id
                );

            if (!report) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Report not found."

                });

            }

            const allowedStatuses = [

                "Reported",

                "Assigned",

                "In Progress",

                "Resolved"

            ];

            const newStatus =
                req.body.status;

            if (
                !allowedStatuses.includes(
                    newStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid status."

                });

            }

            report.status =
                newStatus;

            report.updatedAt =
                new Date().toISOString();

            saveReports(reports);

            res.json({

                success: true,

                message:
                    "Report status updated.",

                report:
                    report

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Unable to update report."

            });

        }

    }
);

// Assign report
app.put(
    "/api/reports/:id/assign",
    (req, res) => {

        try {

            const reports =
                getReports();

            const report =
                reports.find(
                    item =>
                        item.id ===
                        req.params.id
                );

            if (!report) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Report not found."

                });

            }

            report.assignedTo =
                req.body.assignedTo ||
                "Authority Team";

            report.status =
                "Assigned";

            report.updatedAt =
                new Date().toISOString();

            saveReports(reports);

            res.json({

                success: true,

                message:
                    "Report assigned successfully.",

                report:
                    report

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Unable to assign report."

            });

        }

    }
);

// Analytics
app.get(
    "/api/analytics",
    requireAuth,
    (req, res) => {

        const reports =
            getReports();

        const analytics = {

            total:
                reports.length,

            reported:
                reports.filter(
                    r =>
                        r.status ===
                        "Reported"
                ).length,

            assigned:
                reports.filter(
                    r =>
                        r.status ===
                        "Assigned"
                ).length,

            inProgress:
                reports.filter(
                    r =>
                        r.status ===
                        "In Progress"
                ).length,

            resolved:
                reports.filter(
                    r =>
                        r.status ===
                        "Resolved"
                ).length,

            critical:
                reports.filter(
                    r =>
                        r.severity ===
                        "Critical"
                ).length,

            high:
                reports.filter(
                    r =>
                        r.severity ===
                        "High"
                ).length,

            medium:
                reports.filter(
                    r =>
                        r.severity ===
                        "Medium"
                ).length

        };

        res.json({

            success: true,

            analytics:
                analytics

        });

    }
);

// Demo report
app.post(
    "/api/demo-report",
    (req, res) => {

        const reports =
            getReports();

        const demoReport = {

            id:
                "AQ-DEMO-" +
                Date.now(),

            name:
                "Demo Citizen",

            phone:
                "0000000000",

            email:
                "demo@aquaguard.ai",

            issueType:
                "Pipeline Burst",

            description:
                "Major water pipeline burst reported in the demo area.",

            location:
                "Greater Noida",

            latitude:
                28.4744,

            longitude:
                77.5040,

            aiCategory:
                "Pipeline Burst",

            aiConfidence:
                0.95,

            severity:
                "High",

            isDuplicate:
                false,

            duplicateReportId:
                null,

            status:
                "Reported",

            photo:
                null,

            createdAt:
                new Date().toISOString(),

            assignedTo:
                null,

            updatedAt:
                new Date().toISOString()

        };

        reports.unshift(
            demoReport
        );

        saveReports(
            reports
        );

        res.json({

            success: true,

            message:
                "Demo incident created.",

            report:
                demoReport

        });

    }
);

// Frontend
app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                publicFolder,
                "index.html"
            )
        );

    }
);

// Error handler
app.use(
    (error, req, res, next) => {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Server error"

        });

    }
);

// Start server
app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "       AQUAGUARD AI SERVER"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Frontend: http://localhost:${PORT}`
        );

        console.log(
            "========================================"
        );

    }
);