const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Player = require("../models/player");

const router = express.Router();

router.post("/uploadPlayer", async (req, res) => {
    try {
        const player = req.body;
        const newPlayer = new Player(player);
        await newPlayer.save();
        res.status(200).json({ success: true, result: newPlayer });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
