// require("../db/mongoose");
const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
            index: true,
        },
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "match",
            index: true,
        },
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "contest",
            index: true,
        },
        fantasyTeamScore: {
            type: Number,
            required: true,
            default: 0,
        },
        fantasyTeam: {
            teamName: {
                type: String,
                required: true,
            },
            players: [
                new mongoose.Schema(
                    {
                        _id: {
                            type: mongoose.Schema.Types.ObjectId,
                            required: true,
                            ref: "player",
                            index: false,
                        },
                        isCaptain: {
                            type: Boolean,
                            required: true,
                        },
                    },
                    { strict: false }
                ),
            ],
        },
        isJoined: {
            type: Boolean,
            default: false,
            required: true,
        },
        orderId: {
            type: String,
        },
        amount: {
            type: Number,
        },
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transaction",
        },
    },
    {
        timestamps: true,
    }
);

participantSchema.index({ contestId: 1, userId: 1 });
participantSchema.index({ matchId: 1, userId: 1 });
participantSchema.index({ contestId: 1, fantasyTeamScore: 1 });

const participant = mongoose.model("participant", participantSchema);
// const tour1 = new participant({
//     gameId: "60eb29e20a49d77cb784fa6f",
//     name: "Tour-1",
//     isActive: true,
//     isOpen: true,
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = participant;
