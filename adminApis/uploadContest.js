const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Contest = require("../models/contest");
const Match = require("../models/match");

const router = express.Router();

router.post("/uploadContest", async (req, res) => {
    try {
        let totalPrize = 0;
        req.body.prizeBreakUp.forEach((prize) => {
            totalPrize +=
                prize.prizeMoney * (prize.endRank - prize.startRank + 1);
        });
        const contest = req.body;
        const newContest = new Contest(contest);
        await newContest.save();
        const match = await Match.findById(req.body.matchId);
        match.totalFantasyPool += totalPrize;
        match.save();
        res.status(200).json({ success: true, result: newContest });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
