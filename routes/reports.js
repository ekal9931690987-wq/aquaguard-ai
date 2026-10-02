const express = require("express");

const router = express.Router();

// Test route
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AquaGuard reports API is working"
    });
});

module.exports = router;