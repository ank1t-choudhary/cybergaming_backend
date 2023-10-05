const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Player = require("../models/player");

const router = express.Router();

router.get("/getPlayerProfile", async (req, res) => {
    try {
        const playerId = req.query.id;
        const player = await Player.findById(playerId).select({
            participatedIn: 0,
        });

        res.status(200).json({ success: true, result: player });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
