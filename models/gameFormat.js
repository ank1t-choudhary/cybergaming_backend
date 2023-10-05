// require("../db/mongoose");
const mongoose = require("mongoose");

const gameFormatSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "game",
        index: true,
    },
    gameName: {
        type: String,
        required: true,
    },
    shortName: {
        type: String,
        required: true,
    },
    longName: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        // required: true,
    },
});

const gameFormat = mongoose.model("game-format", gameFormatSchema);
// const tour1 = new gameFormat({
//     shortName: "PUBGM",
//     longName: "PUBG Mobile",
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = gameFormat;
