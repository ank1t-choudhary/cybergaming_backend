const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const GameFormat = require("../models/gameFormat");

const router = express.Router();

router.post("/uploadGameFormat", async (req, res) => {
    try {
        const gameFormat = req.body;
        const newGameFormat = new GameFormat(gameFormat);
        await newGameFormat.save();
        res.status(200).json({ success: true, result: newGameFormat });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
