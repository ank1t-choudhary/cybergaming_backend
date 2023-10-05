const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const auth = require("../middleware/accessAuth");
const getUserId = require("../middleware/getUserId");
const Participant = require("../models/participant");
const Contest = require("../models/contest");
const Match = require("../models/match");

const router = express.Router();

// GET /getMyContests?match=match-slug
router.get("/getMyContests", auth, async (req, res) => {
    try {
        const match = await Match.findOne({ slug: req.query.match })
            .select({ _id: 1 })
            .lean();
        const matchId = match._id;
        const userId = await getUserId(req);
        const contestIds = await Participant.find({
            userId,
            matchId,
        }).select({ _id: 0, contestId: 1 });
        const contestIdArray = [];
        contestIds.forEach((contestId) => {
            contestIdArray.push(contestId.contestId);
        });

        // Will not work because contestId's are objects, so can not compare; indexOf will not work
        // const uniqueContestIds = contestIdArray.filter(
        //     (element, index) => index === contestIdArray.indexOf(element)
        // );

        const contests = await Contest.find({
            _id: { $in: contestIdArray },
        }).lean();
        contests.forEach((contest) => {
            contest.isFantasyTeamCreated = true;
        });
        res.status(200).json({ success: true, result: contests });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
