// require("../db/mongoose");
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "game",
            index: true,
        },
        gameFormatId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "game-format",
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        totalFantasyPool: {
            type: Number,
            required: true,
            index: true,
            default: 0,
        },
        totalSlots: Number,
        slotsFilled: Number,
        registrationEndTime: Date,
        matchTime: Date,
        gameRules: mongoose.Schema.Types.Mixed,
        slug: {
            type: String,
            unique: true,
            index: true,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            index: true,
        },
        isOpen: {
            type: Boolean,
            required: true,
            index: true,
        },
        scoreFormula: {
            type: String,
            required: true,
        },
        abbreviations: new mongoose.Schema({}, { strict: false }),
        constants: new mongoose.Schema({}, { strict: false }),
        secondaryScoring: [
            {
                attribute: String,
                start: Number,
                end: Number,
                points: Number,
            },
        ],
        prizeBreakUp: [
            {
                startRank: Number,
                endRank: Number,
                prizeMoney: Number,
            },
        ],
        teams: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "team",
                    index: true,
                },
                name: String,
                logo: String,
            },
        ],
        players: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "player",
                    index: true,
                },
                teamId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "team",
                },
                name: {
                    type: String,
                    required: true,
                },
                photoUrl: {
                    type: String,
                    required: true,
                },
                gameUsername: {
                    type: String,
                    required: true,
                },
                credits: {
                    type: String,
                    required: true,
                    default: 10,
                },
                score: {
                    type: Number,
                    required: true,
                    default: 0,
                    index: true,
                },
                stats: new mongoose.Schema(
                    {
                        position: Number,
                        kills: Number,
                        assists: Number,
                        isAlive: Number,
                    },
                    { strict: false }
                ),
            },
        ],
    },
    {
        timestamps: true,
    }
);

const match = mongoose.model("match", matchSchema);
// const tour1 = new match({
//     gameId: "60eb29e20a49d77cb784fa6f",
//     name: "Tour-1",
//     isActive: true,
//     isOpen: true,
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = match;
