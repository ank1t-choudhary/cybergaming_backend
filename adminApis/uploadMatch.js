const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Match = require("../models/match");

const router = express.Router();

router.post("/uploadMatch", async (req, res) => {
    try {
        const match = req.body;
        const newMatch = new Match(match);
        await newMatch.save();
        res.status(200).json({ success: true, result: newMatch });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
