const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Match = require("../models/match");
const Contest = require("../models/contest");
const Participant = require("../models/participant");
const getUserId = require("../middleware/getUserId");

const router = express.Router();

// GET /getContests?match=match-slug
router.get("/getContests", async (req, res) => {
    try {
        let joinedContests = [];
        const userId = await getUserId(req);

        const contests = await Contest.find({
            matchSlug: req.query.match,
        }).lean();
        if (userId) {
            const match = await Match.findOne({ slug: req.query.match })
                .select({ _id: 1 })
                .lean();
            const joinedContestArray = await Participant.find({
                userId,
                matchId: match._id,
            })
                .select({ contestId: 1, _id: 0 })
                .lean();
            joinedContestArray.forEach((contest) => {
                joinedContests.push(JSON.stringify(contest.contestId));
            });
        }
        contests.forEach((contest) => {
            contest.isFantasyTeamCreated = joinedContests.includes(
                JSON.stringify(contest._id)
            );
        });
        res.status(200).json({
            success: true,
            result: contests,
        });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
