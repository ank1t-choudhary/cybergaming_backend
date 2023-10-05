// require("../db/mongoose");
const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            required: true,
        },
        players: [
            {
                playerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "player",
                },
                playerName: {
                    type: String,
                    required: true,
                },
                playerPhoto: {
                    type: String,
                    // required: true
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const team = mongoose.model("team", teamSchema);
// const tour1 = new team({
//     name: "Alpha",
//     logo: "andja",
// });
// tour1.players.push({
//     playerId: "6133b851d1aad7a53b0d6d7a",
//     playerName: "true",
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = team;
