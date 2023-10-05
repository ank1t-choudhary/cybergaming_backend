// require("../db/mongoose");
const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
    {
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "match",
            index: true,
        },
        matchSlug: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        entryFee: {
            type: Number,
            required: true,
        },
        entryFeeAfterStriked: {
            type: Number,
            required: true,
        },
        fantasyTeamSize: {
            type: Number,
            required: true,
        },
        totalSlots: {
            type: Number,
            required: true,
        },
        slotsFilled: {
            type: Number,
            required: true,
        },
        isFilled: {
            type: Boolean,
            required: true,
            index: true,
        },
        prizeBreakUp: [
            {
                startRank: Number,
                endRank: Number,
                prizeMoney: Number,
            },
        ],
        scoring: [
            new mongoose.Schema(
                {
                    metric: String,
                    metricLabel: String,
                    example: String,
                    points: Number,
                    pointsLabel: String,
                    pointsStartWith: Number,
                },
                { strict: false }
            ),
        ],
    },
    {
        timestamps: true,
    }
);

const contest = mongoose.model("contest", contestSchema);
// const tour1 = new contest({
//     matchId: "60eb29e20a49d77cb784fa6f",
//     name: "Contest-1",
// });
// tour1.scoring.push({ metric: "Hemlo", asdf: "hdskk" });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = contest;
