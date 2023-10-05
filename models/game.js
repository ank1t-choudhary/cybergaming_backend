// require("../db/mongoose");
const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
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

const game = mongoose.model("game", gameSchema);
// const tour1 = new game({
//     shortName: "PUBGM",
//     longName: "PUBG Mobile",
// });
// tour1.save().then((tour) => {
//     console.log(tour);
// });

module.exports = game;
