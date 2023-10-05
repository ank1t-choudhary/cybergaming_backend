const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Player = require("../models/player");

const router = express.Router();

router.get("/getPlayers", async (req, res) => {
    try {
        const players = await Player.find().select({
            participatedIn: 0,
            email: 0,
            facebookId: 0,
            instagramId: 0,
        });

        res.status(200).json({ success: true, result: players });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
