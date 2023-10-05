// require("../db/mongoose");
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        photoUrl: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: Number,
            required: true,
        },
        facebookId: String,
        instagramId: String,
        participatedIn: [
            new mongoose.Schema(
                {
                    matchId: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                        ref: "match",
                    },
                    points: Number,
                    position: Number,
                    kills: Number,
                    assists: Number,
                },
                { strict: false }
            ),
        ],
        ratings: [
            new mongoose.Schema(
                {
                    gameId: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                        ref: "game",
                        index: true,
                    },
                    rating: Number,
                },
                { strict: false }
            ),
        ],
    },
    {
        timestamps: true,
    }
);

const player = mongoose.model("player", playerSchema);
// const tour1 = new player({
//     name: "Alpha",
//     photoUrl: "andja",
//     email: "andjd",
//     phoneNo: 999999999999,
// });
// tour1.participatedIn.push({
//     tournamentId: "6133b851d1aad7a53b0d6d7a",
//     isalive: true,
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = player;
