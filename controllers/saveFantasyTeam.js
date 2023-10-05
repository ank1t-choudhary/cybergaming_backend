const express = require("express");
const mongoose = require("mongoose");

const auth = require("../middleware/accessAuth");
const { calculateResponseTime } = require("../middleware/apiTime");
const Participant = require("../models/participant");
const getUserId = require("../middleware/getUserId");

const router = express.Router();

// GET /saveFantasyTeam
router.post("/saveFantasyTeam", auth, async (req, res) => {
    try {
        const userId = await getUserId(req);
        let participant = new Participant();
        const { recordId, matchId, contestId, fantasyTeam } = req.body;
        if (mongoose.Types.ObjectId.isValid(recordId)) {
            participant = await Participant.findById(recordId);
        }
        if (!participant.userId) {
            participant.userId = userId;
            participant.matchId = matchId;
            participant.contestId = contestId;
        }
        participant.fantasyTeam = fantasyTeam;
        await participant.save();
        res.status(200).json({ success: true, result: participant });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
