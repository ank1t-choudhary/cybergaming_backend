const express = require("express");

const auth = require("../middleware/accessAuth");
const { calculateResponseTime } = require("../middleware/apiTime");
const getUserId = require("../middleware/getUserId");
const Participant = require("../models/participant");
const Match = require("../models/match");
const Games = require("../models/game"); //for populating the gameId

const router = express.Router();

// GET /getMyMatches
router.get("/getMyMatches", auth, async (req, res) => {
    try {
        const userId = await getUserId(req);
        const matchIds = await Participant.find({
            userId,
        }).select({ matchId: 1 });

        // Creating array of distict ids; can be improved by using hashTables
        // const uniqueMatchIds = matchIds.filter(
        //     (element, index, array) =>
        //         index ===
        //         array.findIndex((temp) => temp.matchId === element.matchId)
        // );

        const matchIdArray = [];
        matchIds.forEach((matchId) => {
            matchIdArray.push(matchId.matchId);
        });

        const matches = await Match.find({
            _id: { $in: matchIdArray },
        }).populate("gameId");

        res.status(200).json({ success: true, result: matches });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
