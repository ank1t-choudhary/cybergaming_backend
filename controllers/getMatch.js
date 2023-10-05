const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Match = require("../models/match");
const Game = require("../models/game"); //for populating the gameId

const router = express.Router();

// GET /getMatch?match=match-slug
router.get("/getMatch", async (req, res) => {
    try {
        const match = await Match.findOne({ slug: req.query.match })
            .populate("gameId")
            .lean();
        match.game = match.gameId;
        delete match.gameId;
        res.status(200).json({ success: true, result: match });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
