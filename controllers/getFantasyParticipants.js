const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const getUserId = require("../middleware/getUserId");
const Participant = require("../models/participant");
const User = require("../models/user");

const router = express.Router();

// GET /getFantasyParticipants?id=chsdbvhbschbshcbsbchbasc&limit=10&offset=20
router.get("/getFantasyParticipants", async (req, res) => {
    try {
        const userId = await getUserId(req);
        const participants = await Participant.find({
            contestId: req.query.id,
        })
            .sort({
                fantasyTeamScore: -1,
            })
            .skip(parseInt(req.query.offset))
            .limit(parseInt(req.query.limit));
        const fantasyParticipants = [];
        let myFantasyTeams = [];
        if (userId) {
            myFantasyTeams = await Participant.find({
                contestId: req.query.id,
                userId,
            })
                .select({
                    userId: 0,
                    matchId: 0,
                    contestId: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                })
                .lean();
            myFantasyTeams.forEach((team) => {
                team.recordId = team._id;
                delete team._id;
            });
        }
        // await participants.forEach(async (participant) => {
        //     const user = await User.findById(participant.userId);
        //     fantasyParticipants.push({
        //         fname: user.fname,
        //         lname: user.lname,
        //         photoUrl: user.photoUrl,
        //         fantasyTeam: participant.fantasyTeam,
        //     });
        // });
        await Promise.all(
            participants.map(async (participant) => {
                const user = await User.findById(participant.userId);
                fantasyParticipants.push({
                    userId: user._id,
                    name: user.name,
                    photoUrl: user.photoUrl,
                    recordId: participant._id,
                    fantasyTeamScore: participant.fantasyTeamScore,
                    fantasyTeam: participant.fantasyTeam,
                });
            })
        );
        res.status(200).json({
            success: true,
            result: {
                contestId: req.query.id,
                fantasyParticipants,
                myFantasyTeams,
            },
        });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: [] });
        calculateResponseTime(req);
    }
});

module.exports = router;
