const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Match = require("../models/match");
const Game = require("../models/game"); //for populating the gameId

const router = express.Router();

// GET /getMatches?category=6133de8c9227acc47bade3e4&category=6133de8c9227acc47bade3e4&limit=10&offset=20
router.get("/getMatches", async (req, res) => {
    try {
        if (req.query.category) {
            const games = req.query.category;
            const matches = await Match.find({ gameId: { $in: games } })
                .skip(parseInt(req.query.offset))
                .limit(parseInt(req.query.limit))
                .populate("gameId")
                .lean();
            matches.forEach((match) => {
                match.game = match.gameId;
                delete match.gameId;
            });
            res.status(200).json({ success: true, result: matches });
        } else {
            const games = [];
            const allGames = await Game.find();
            allGames.forEach((game) => {
                games.push(game._id);
            });
            const matches = await Match.find({ gameId: { $in: games } })
                .skip(parseInt(req.query.offset))
                .limit(parseInt(req.query.limit))
                .populate("gameId")
                .lean();
            matches.forEach((match) => {
                match.game = match.gameId;
                delete match.gameId;
            });
            res.status(200).json({ success: true, result: matches });
        }
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
