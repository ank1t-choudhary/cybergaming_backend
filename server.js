const environment = process.env.NODE_ENV;
// const environment = 'production';

const config = require("./env.json")[environment || "development"];

const cors = require("cors");
const express = require("express");
const app = express();
require("./db/mongoose");

app.use(cors({ origin: config.CORS_ORIGIN }));

const tokenRouter = require("./controllers/token");
const loginRouter = require("./controllers/login");
const startUserSessionRouter = require("./controllers/startUserSession");
const logoutRouter = require("./controllers/logout");
const getMatches = require("./controllers/getMatches");
const getMatch = require("./controllers/getMatch");
const getMyMatches = require("./controllers/getMyMatches");
const getContests = require("./controllers/getContests");
const getContest = require("./controllers/getContest");
const getMyContests = require("./controllers/getMyContests");
const saveFantasyTeam = require("./controllers/saveFantasyTeam");
const getFantasyParticipants = require("./controllers/getFantasyParticipants");
const getGames = require("./controllers/getGames");
const getUserProfile = require("./controllers/getUserProfile");
const updateUserProfile = require("./controllers/updateUserProfile");
const getPlayerProfile = require("./controllers/getPlayerProfile");
const getPlayers = require("./controllers/getPlayers");
const joinFantasyContest = require("./controllers/joinFantasyContest");
const joinFantasyContestTransactionCallback = require("./controllers/joinFantasyContestTransactionCallback");
const { initiateApiTime } = require("./middleware/apiTime");

app.use(initiateApiTime);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(tokenRouter);
app.use(loginRouter);
app.use(startUserSessionRouter);
app.use(logoutRouter);
app.use(getMatches);
app.use(getMatch);
app.use(getMyMatches);
app.use(getContests);
app.use(getContest);
app.use(getMyContests);
app.use(saveFantasyTeam);
app.use(getFantasyParticipants);
app.use(getGames);
app.use(getUserProfile);
app.use(updateUserProfile);
app.use(getPlayerProfile);
app.use(getPlayers);
app.use(joinFantasyContest);
app.use(joinFantasyContestTransactionCallback);

app.listen(8080, () => {
    console.log("Server listening on port 8080.");
});
