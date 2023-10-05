const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Game = require("../models/game");

const router = express.Router();

// GET /getGames
router.get("/getGames", async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json({ success: true, result: games });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
