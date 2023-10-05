const environment = process.env.NODE_ENV;
// const environment = 'production';

const config = require("./env.json")[environment || "development"];

const cors = require("cors");
const express = require("express");
const app = express();
require("./db/mongoose");

app.use(cors({ origin: config.CORS_ORIGIN }));

const uploadContest = require("./adminApis/uploadContest");
const uploadMatch = require("./adminApis/uploadMatch");
const uploadGame = require("./adminApis/uploadGame");
const uploadTeam = require("./adminApis/uploadTeam");
const uploadGameFormat = require("./adminApis/uploadGameFormat");
const uploadPlayer = require("./adminApis/uploadPlayer");
const updateScore = require("./adminApis/updateScore");
const { initiateApiTime } = require("./middleware/apiTime");

app.use(initiateApiTime);
app.use(express.json());
app.use("/admin", uploadContest);
app.use("/admin", uploadMatch);
app.use("/admin", uploadGame);
app.use("/admin", uploadTeam);
app.use("/admin", uploadGameFormat);
app.use("/admin", uploadPlayer);
app.use("/admin", updateScore);

app.listen(3000, () => {
    console.log("Admin Server listening on port 3000.");
});
