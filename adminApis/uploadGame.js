const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Game = require("../models/game");

const router = express.Router();

router.post("/uploadGame", async (req, res) => {
    try {
        const game = req.body;
        const newGame = new Game(game);
        await newGame.save();
        res.status(200).json({ success: true, result: newGame });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
