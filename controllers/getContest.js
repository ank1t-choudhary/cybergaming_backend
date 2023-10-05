const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const getUserId = require("../middleware/getUserId");
const Participant = require("../models/participant");
const Contest = require("../models/contest");

const router = express.Router();

// GET /getContest?id=contest-id
router.get("/getContest", async (req, res) => {
    try {
        let isJoined = false;
        const userId = await getUserId(req);
        const contest = await Contest.findById(req.query.id).lean();
        if (userId) {
            const joinedContest = await Participant.findOne({
                userId,
                contestId: req.query.id,
            });
            if (joinedContest) isJoined = true;
        }
        contest.isFantasyTeamCreated = isJoined;
        res.status(200).json({ success: true, result: contest });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
