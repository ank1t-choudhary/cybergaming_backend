const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const Team = require("../models/team");

const router = express.Router();

router.post("/uploadTeam", async (req, res) => {
    try {
        const team = req.body;
        const newTeam = new Team(team);
        await newTeam.save();
        res.status(200).json({ success: true, result: newTeam });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
