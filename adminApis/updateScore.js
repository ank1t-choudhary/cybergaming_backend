const express = require("express");

const calcScore = require("../middleware/calcScore");
const { calculateResponseTime } = require("../middleware/apiTime");
const Match = require("../models/match");

const router = express.Router();
// POST /updateScore
router.post("/updateScore", async (req, res) => {
    try {
        req.body.players.forEach((player) => {
            let tempObject = {};
            for (item in req.body.abbreviations) {
                tempObject[item] = player.stats[req.body.abbreviations[item]];
            }
            for (item in req.body.constants) {
                tempObject[item] = req.body.constants[item];
            }
            player.score = calcScore(req.body.scoreFormula, tempObject);
            if (
                req.body.secondaryScoring &&
                req.body.secondaryScoring.length > 0
            )
                req.body.secondaryScoring.forEach((element) => {
                    if (
                        player.stats[element.attribute] >= element.start &&
                        player.stats[element.attribute] <= element.end
                    )
                        player.score += element.points;
                });
        });
        const match = await Match.findById(req.body._id);
        match.players = req.body.players;
        await match.save();

        res.status(200).json({ success: true, result: req.body });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
