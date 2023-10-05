const environment = process.env.NODE_ENV;
// const environment = 'production';

const config = require("./env.json")[environment || "development"];
const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const Paytm = require("paytm-pg-node-sdk");
const PaytmChecksum = require("paytmchecksum");
const https = require("https");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

//
const jwt = require("jsonwebtoken");
require("./db/mongoose");
const generateTokens = require("./middleware/generateTokens");
const timeStamp = require("time-stamp");
const User = require("./models/user");
const ErrorLog = require("./models/errorLogs");
const {
    identifiedSessions,
    unIdentifiedSessions,
} = require("./models/session");
const validateAccessToken = require("./middleware/socialAuth");
const createNewUser = require("./middleware/createNewUser");
const accessAuth = require("./middleware/accessAuth");
const {
    initiateApiTime,
    calculateResponseTime,
} = require("./middleware/apiTime");
//

const app = express();
app.use(initiateApiTime);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoClient = new MongoClient(config.MONGO_URI, config.MONGO_OPTIONS);
let db;
const connectMongoDb = async () => {
    if (!db || !mongoClient.connect) {
        db = await mongoClient.connect();
        db = mongoClient.db(config.DB_NAME);
        return db;
    }
    return db;
};
const closeMongoDbConnection = async () => {
    // mongoClient.close();
};

var router = express.Router();

// USE IT BEFORE ALL ROUTE DEFINITIONS
app.use(cors({ origin: config.CORS_ORIGIN }));

// BASE PATH
// app.use('/api', router);
app.use("", router);

const getUserId = async (req) => {
    // return req.headers.authorization || null;
    const authHeader = req.header("Authorization");
    if (!authHeader) return null;
    const token = authHeader.replace("Bearer ", "");

    let userId = null;
    await jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        {
            issuer: "cybergaming.in",
            // subject: req.body._id,
            // subject: decoded.sub,
        },
        (err, user) => {
            if (err) {
                userId = null;
            } else {
                userId = user.sub;
            }
        }
    );
    return userId;
};

const getJoinedContests = async (matchId, userId) => {
    db = await connectMongoDb();

    let joinedContests = [];
    joinedContests = await db
        .collection("participants")
        .aggregate([
            {
                $match: {
                    tournamentId: ObjectId(matchId),
                    userId: ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ])
        .toArray();

    joinedContests &&
        joinedContests.map((item) => {
            item.user =
                item.user && item.user.length > 0 ? item.user[0] : item.user;
        });

    return await joinedContests;
};

const getContestDetails = async (matchId, contestId) => {
    db = await connectMongoDb();

    let contest = { _id: contestId };
    let matches = [];
    matches = await db
        .collection("tournaments")
        .aggregate([
            {
                $match: {
                    _id: ObjectId(matchId),
                },
            },
        ])
        .toArray();
    let matchDetails =
        Array.isArray(matches) && matches.length > 0 ? matches[0] : matches;
    matchDetails &&
        matchDetails.contests &&
        matchDetails.contests.map((matchContest) => {
            if (matchContest._id.toString() === contestId.toString()) {
                contest = matchContest;
            }
        });

    return contest;
};

const getTransactionDetails = async (orderId) => {
    db = await connectMongoDb();

    let transactions = [];
    transactions = await db
        .collection("transactions")
        .aggregate([
            {
                $match: {
                    orderId: orderId,
                },
            },
        ])
        .toArray();
    let transactionDetails =
        Array.isArray(transactions) && transactions.length > 0
            ? transactions[0]
            : transactions;

    return transactionDetails;
};

router.post(
    "/login",
    /*validateAccessToken,*/ async (req, res) => {
        try {
            // const ip =
            // 	req.headers["x-forwarded-for"]?.split(",").shift() ||
            // 	req.socket?.remoteAddress ||
            // 	null;
            const geoData = req.body.userGeoData;
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                if (req.body.provider === "GOOGLE") {
                    if (!user.googleId) {
                        const decoded = jwt.decode(req.body.idToken, {
                            complete: true,
                        });
                        user.googleId = decoded.payload.sub;
                        await user.save();
                    }
                } else {
                    if (!user.facebookId) {
                        user.facebookId = req.body.id;
                        await user.save();
                    }
                }
            } else {
                const newUser = await createNewUser(req);
                if (newUser.success === "true") user = newUser.user;
                else {
                    res.status(500).send({
                        success: false,
                        message: newUser.error,
                    });
                    return calculateResponseTime(req);
                }
            }
            const { accessToken, refreshToken } = await generateTokens(
                user,
                geoData
            );
            res.json({
                success: true,
                result: user,
                accessToken,
                refreshToken,
            });
            calculateResponseTime(req);
        } catch (e) {
            console.log(e);
            res.status(400).json({ success: false, message: e });
            calculateResponseTime(req);
        }
    }
);

router.post("/logout", async (req, res) => {
    let sessionLogoutDetails = {};
    let user = {};
    try {
        const token = req.body.refreshToken;
        const payLoad = jwt.decode(token);
        user = await User.findOne({ _id: payLoad.sub });

        user.tokens = user.tokens.filter((token) => {
            if (token.token === req.body.refreshToken) {
                sessionLogoutDetails = token;
                return false;
            }
            return true;
        });
        await user.save();
        res.send({ token });
        calculateResponseTime(req);
    } catch (e) {
        res.status(500).send();
        calculateResponseTime(req);
    }
    try {
        const userSessions = await identifiedSessions.findOne({
            id: user._id,
            email: user.email,
        });
        userSessions.sessions = userSessions.sessions.concat({
            action: "Logged Out",
            timeStamp: timeStamp("YYYY/MM/DD-HH:mm:ss"),
            tokenUsed: sessionLogoutDetails.token,
            geoData: sessionLogoutDetails.geoData,
        });
        await userSessions.save();
    } catch (e) {
        console.log(e);
    }
});

router.post(
    "/startUserSession",
    async (req, res, next) => {
        try {
            const authHeader = req.header("Authorization");
            if (authHeader && authHeader.replace("Bearer ", "") != "") {
                req.noNext = "true";
                next();
                const action =
                    req.body.newLogIn === "true"
                        ? "Logged In"
                        : "Session Initiated";
                if (req.invalidate === "true") return;
                const userSessions = await identifiedSessions.findOne({
                    id: req.user.sub,
                    email: req.user.email,
                });
                if (userSessions) {
                    userSessions.sessions = userSessions.sessions.concat({
                        action,
                        timeStamp: timeStamp("YYYY/MM/DD-HH:mm:ss"),
                        tokenUsed: req.token,
                        geoData: req.body.userGeoData,
                    });
                    await userSessions.save();
                } else {
                    const newUserSession = new identifiedSessions({
                        id: req.user.sub,
                        email: req.user.email,
                    });
                    console.log(newUserSession);
                    newUserSession.sessions = newUserSession.sessions.push({
                        action,
                        timeStamp: timeStamp("YYYY/MM/DD-HH:mm:ss"),
                        tokenUsed: req.token,
                        geoData: req.body.userGeoData,
                    });
                    await newUserSession.save();
                }
                res.send({ success: "true", token: req.token });
                calculateResponseTime(req);
            } else {
                const newSession = new unIdentifiedSessions({
                    timeStamp: timeStamp("YYYY/MM/DD-HH:mm:ss"),
                    geoData: req.body.userGeoData,
                });
                await newSession.save();
                res.send({ success: "true" });
                calculateResponseTime(req);
            }
        } catch (e) {
            console.log(e);
            res.status(500).send({ success: "false" });
            calculateResponseTime(req);
            const errorLog = new ErrorLog({
                time: new Date(),
                file: "app.js->/startUserSession",
                // line: String,
                info: e,
                // type: String,
            });
            await errorLog.save();
        }
    },
    accessAuth
);

router.post("/token", async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).send({
                success: "false",
                error: "Refresh Token not found",
            });
            return calculateResponseTime(req);
        }
        // const payLoad = jwt.decode(refreshToken);
        jwt.verify(
            refreshToken,
            config.REFRESH_TOKEN_SECRET,
            {
                audience: "/token",
                issuer: "cybergaming.in",
                // subject: req.body._id,
                // subject: payLoad.sub,
            },
            async (error, refreshTokenPayload) => {
                if (error) {
                    // console.log(error);
                    res.status(402).send({
                        success: "false",
                        error: "Invalid Refresh Token",
                    });
                    return calculateResponseTime(req);
                }
                const user = await User.findOne({
                    _id: refreshTokenPayload.sub,
                    "tokens.token": refreshToken,
                });
                if (!user) {
                    res.status(403).send({
                        success: "false",
                        error: "Invalid refresh token",
                    });
                    return calculateResponseTime(req);
                }
                const payLoad = {
                    name: user.name,
                    email: user.email,
                    photoUrl: user.photoUrl,
                };
                const accessToken = jwt.sign(
                    payLoad,
                    config.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: 3600,
                        issuer: "cybergaming.in",
                        subject: user._id.toString(),
                    }
                );
                res.json({
                    success: true,
                    result: user,
                    accessToken,
                    refreshToken,
                });
                calculateResponseTime(req);
            }
        );
    } catch (e) {
        console.log(e);
        res.status(400).send({ success: "false", error: e });
        calculateResponseTime(req);
    }
});

router.get("/getGames", async (req, res) => {
    db = await connectMongoDb();

    await db
        .collection("games")
        .find({})
        .toArray((err, result) => {
            if (err) throw err;

            res.status(200);
            closeMongoDbConnection();
            if (result) {
                res.json({ success: true, result: result });
            } else {
                res.json({ success: false, result: [] });
            }
        });
});

router.get("/getPlayers", async (req, res) => {
    db = await connectMongoDb();

    await db
        .collection("users")
        .find({})
        .toArray((err, result) => {
            if (err) throw err;

            res.status(200);
            closeMongoDbConnection();
            if (result) {
                res.json({ success: true, result: result });
            } else {
                res.json({ success: false, result: [] });
            }
        });
});

router.get("/getTournaments", async (req, res) => {
    db = await connectMongoDb();

    await db
        .collection("tournaments")
        .aggregate([
            {
                $lookup: {
                    from: "games",
                    localField: "gameId",
                    foreignField: "_id",
                    as: "game",
                },
            },
        ])
        .toArray((err, result) => {
            if (err) throw err;

            res.status(200);
            closeMongoDbConnection();
            if (result) {
                result.map((item) => {
                    item.game =
                        item.game && item.game.length > 0
                            ? item.game[0]
                            : item.game;
                });
                res.json({ success: true, result: result });
            } else {
                res.json({ success: false, result: [] });
            }
        });
});

router.get("/getTournamentDetails", async (req, res) => {
    db = await connectMongoDb();

    const { slug } = req.query;
    const userId = await getUserId(req);

    await db
        .collection("tournaments")
        .aggregate([
            {
                $match: {
                    slug: slug,
                },
            },
            {
                $lookup: {
                    from: "games",
                    localField: "gameId",
                    foreignField: "_id",
                    as: "game",
                },
            },
        ])
        .toArray(async (err, result) => {
            if (err) throw err;

            res.status(200);
            closeMongoDbConnection();
            if (result) {
                result = result && result.length > 0 ? result[0] : result;
                result.game =
                    result.game && result.game.length > 0
                        ? result.game[0]
                        : result.game;

                let joinedContests = await getJoinedContests(
                    result._id,
                    userId
                );
                result &&
                    result.contests &&
                    result.contests.map((contest) => {
                        contest.isFantasyTeamCreated =
                            joinedContests.filter((joinedContest) => {
                                return (
                                    joinedContest.contestId.toString() ==
                                    contest._id.toString()
                                );
                            }).length > 0;
                        // contest.isJoined = joinedContests.filter((joinedContest) => {return joinedContest.contestId.toString()==contest._id.toString()}).length>0;
                    });

                res.json({ success: true, result: result });
            } else {
                res.json({ success: false, result: null });
            }
        });
});

router.get("/getFantasyParticipants", async (req, res) => {
    db = await connectMongoDb();

    const { tournamentId, contestId } = req.query;

    await db
        .collection("participants")
        .aggregate([
            {
                $match: {
                    tournamentId: ObjectId(tournamentId),
                    contestId: ObjectId(contestId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ])
        .toArray((err, result) => {
            if (err) throw err;

            res.status(200);
            closeMongoDbConnection();
            if (result) {
                result.map((item) => {
                    item.user =
                        item.user && item.user.length > 0
                            ? item.user[0]
                            : item.user;
                });
                res.json({ success: true, result: result });
            } else {
                res.json({ success: false, result: [] });
            }
        });
});

router.get("/getMyContests", async (req, res) => {
    db = await connectMongoDb();

    const userId = await getUserId(req);

    await db
        .collection("participants")
        .aggregate([
            {
                $match: {
                    userId: ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ])
        .toArray(async (err, participantsResponse) => {
            if (err) throw err;

            res.status(200);
            if (participantsResponse) {
                let tournamentIds = [];
                let tournamentObjectIds = [];
                let contestIds = [];
                participantsResponse &&
                    participantsResponse.map((participant) => {
                        if (
                            !tournamentIds.includes(
                                participant.tournamentId.toString()
                            )
                        ) {
                            tournamentIds.push(
                                participant.tournamentId.toString()
                            );
                        }
                        if (
                            !contestIds.includes(
                                participant.contestId.toString()
                            )
                        ) {
                            contestIds.push(participant.contestId.toString());
                        }
                    });

                for (let i = 0; i < tournamentIds.length; i++) {
                    tournamentObjectIds.push(new ObjectId(tournamentIds[i]));
                }

                await db
                    .collection("tournaments")
                    .aggregate([
                        {
                            $match: {
                                _id: { $in: tournamentObjectIds },
                            },
                        },
                        {
                            $lookup: {
                                from: "games",
                                localField: "gameId",
                                foreignField: "_id",
                                as: "game",
                            },
                        },
                    ])
                    .toArray((err, result) => {
                        if (err) throw err;

                        res.status(200);
                        closeMongoDbConnection();
                        if (result) {
                            result.map((item) => {
                                item.game =
                                    item.game && item.game.length > 0
                                        ? item.game[0]
                                        : item.game;
                            });
                            res.json({
                                success: true,
                                result: {
                                    tournaments: result,
                                    contestIds: contestIds,
                                },
                            });
                        } else {
                            res.json({ success: false, result: [] });
                        }
                    });
            } else {
                closeMongoDbConnection();
                res.json({ success: false, result: [] });
            }
        });
});

router.post("/saveFantasyTeam", async (req, res) => {
    db = await connectMongoDb();

    const { recordId, tournamentId, contestId, fantasyTeam } = req.body;
    const userId = await getUserId(req);

    if (recordId && recordId.length > 0) {
        await db.collection("participants").updateOne(
            {
                _id: ObjectId(recordId),
                tournamentId: ObjectId(tournamentId),
                contestId: ObjectId(contestId),
                userId: ObjectId(userId),
            },
            {
                $set: {
                    tournamentId: ObjectId(tournamentId),
                    contestId: ObjectId(contestId),
                    userId: ObjectId(userId),
                    fantasyTeam: fantasyTeam,
                },
            },
            {
                upsert: true,
            },
            function (err, result) {
                if (err) throw err;

                res.status(200);
                closeMongoDbConnection();
                if (result) {
                    res.json({ success: true, result: result });
                } else {
                    res.json({ success: false });
                }
            }
        );
    } else {
        await db.collection("participants").insertOne(
            {
                tournamentId: ObjectId(tournamentId),
                contestId: ObjectId(contestId),
                userId: ObjectId(userId),
                fantasyTeam: fantasyTeam,
            },
            function (err, result) {
                if (err) throw err;

                res.status(200);
                closeMongoDbConnection();
                if (result) {
                    res.json({ success: true, result: result });
                } else {
                    res.json({ success: false });
                }
            }
        );
    }
});

router.post("/joinFantasyContest", async (req, res) => {
    db = await connectMongoDb();

    const { user, tournamentId, tournamentSlug, contestId, fantasyTeamId } =
        req.body;
    const userId = await getUserId(req);

    const orderId = "CGFANTASY" + new Date().getTime();
    let transactionAmount = "1.00";

    let contestDetails = await getContestDetails(tournamentId, contestId);
    transactionAmount = contestDetails.entryFee;

    /*
     * import checksum generation utility
     * You can get this utility from https://developer.paytm.com/docs/checksum/
     */

    var paytmParams = {};
    paytmParams.body = {
        requestType: "Payment",
        mid: config.PAYTM_MID,
        websiteName: config.PAYTM_WEBSITE,
        orderId: orderId,
        callbackUrl: config.API_BASE + "joinFantasyContestTransactionCallback",
        txnAmount: {
            value: transactionAmount.toString(),
            currency: "INR",
        },
        userInfo: {
            custId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            mobile: user.phoneNumber,
        },
    };

    /*
     * Generate checksum by parameters we have in body
     * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
     */
    PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        config.PAYTM_KEY
    ).then(async function (checksum) {
        paytmParams.head = {
            signature: checksum,
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {
            hostname: config.PAYTM_PAYMENT_URL,
            port: 443,
            path:
                "/theia/api/v1/initiateTransaction?mid=" +
                config.PAYTM_MID +
                "&orderId=" +
                orderId,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
            },
        };

        var response = "";
        var post_req = https.request(options, async function (post_res) {
            post_res.on("data", function (chunk) {
                response += chunk;
            });

            post_res.on("end", async function () {
                response = JSON.parse(response);

                await db.collection("transactions").insertOne(
                    {
                        orderId: orderId,
                        transactionToken: response.body.txnToken,
                        amount: transactionAmount,
                        tournamentId: ObjectId(tournamentId),
                        tournamentSlug: tournamentSlug,
                        contestId: ObjectId(contestId),
                        fantasyTeamId: ObjectId(fantasyTeamId),
                        userId: ObjectId(userId),
                    },
                    function (err, result) {}
                );

                let paytmForm = `
                <form method="post" action="https://${config.PAYTM_PAYMENT_URL}/theia/api/v1/showPaymentPage?mid=${config.PAYTM_MID}&orderId=${orderId}" name="paytm">
                    <table border="1">
                        <tbody>
                            <input type="hidden" name="mid" value="${config.PAYTM_MID}">
                                <input type="hidden" name="orderId" value="${orderId}">
                                <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                        </tbody>
                    </table>
                    <script type="text/javascript"> document.paytm.submit(); </script>
                </form>`;

                closeMongoDbConnection();
                res.json({ success: true, paytmForm: paytmForm });
            });
        });

        post_req.write(post_data);
        post_req.end();
    });
});

router.post("/joinFantasyContestTransactionCallback", async (req, res) => {
    db = await connectMongoDb();

    const data = req.body;
    const orderId = data.ORDERID;
    const paytmChecksum = data.CHECKSUMHASH;

    let transactionDetails = await getTransactionDetails(orderId);
    const { tournamentSlug, tournamentId, contestId, fantasyTeamId, userId } =
        transactionDetails;

    var isVerifySignature = await PaytmChecksum.verifySignature(
        data,
        config.PAYTM_KEY,
        paytmChecksum
    );
    if (isVerifySignature) {
        var paytmParams = {};
        paytmParams.body = {
            mid: config.PAYTM_MID,
            orderId: orderId,
        };

        PaytmChecksum.generateSignature(
            JSON.stringify(paytmParams.body),
            config.PAYTM_KEY
        ).then(async function (checksum) {
            paytmParams.head = {
                signature: checksum,
            };

            var post_data = JSON.stringify(paytmParams);
            var options = {
                hostname: config.PAYTM_PAYMENT_URL,
                port: 443,
                path: "/v3/order/status",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": post_data.length,
                },
            };

            // Set up the request
            var response = "";
            var post_req = https.request(options, async function (post_res) {
                post_res.on("data", function (chunk) {
                    response += chunk;
                });

                post_res.on("end", async function () {
                    response = JSON.parse(response);

                    if (
                        response &&
                        response.body &&
                        response.body.resultInfo &&
                        response.body.resultInfo.resultStatus === "TXN_SUCCESS"
                    ) {
                        await db.collection("transactions").updateOne(
                            {
                                orderId: orderId,
                            },
                            {
                                $set: {
                                    orderId: orderId,
                                    transactionId: response.body.txnId,
                                    transactionStatus:
                                        response.body.resultInfo.resultStatus,
                                    amount: response.body.txnAmount,
                                    tournamentId: ObjectId(tournamentId),
                                    contestId: ObjectId(contestId),
                                    fantasyTeamId: ObjectId(fantasyTeamId),
                                    userId: ObjectId(userId),
                                    transactionDetails: response.body,
                                },
                            },
                            {
                                upsert: true,
                            },
                            function (err, result) {}
                        );

                        await db.collection("participants").updateOne(
                            {
                                _id: fantasyTeamId,
                            },
                            {
                                $set: {
                                    isJoined: true,
                                    orderId: orderId,
                                    amount: response.body.txnAmount,
                                },
                            },
                            {
                                upsert: true,
                            },
                            function (err, result) {}
                        );
                    } else {
                        await db.collection("transactions").updateOne(
                            {
                                orderId: orderId,
                            },
                            {
                                $set: {
                                    transactionStatus:
                                        (response &&
                                            response.body &&
                                            response.body.resultInfo &&
                                            response.body.resultInfo
                                                .resultStatus) ||
                                        "FAILED",
                                },
                            },
                            function (err, result) {}
                        );
                    }

                    closeMongoDbConnection();
                    res.set("Content-Type", "text/html");
                    res.write(
                        '<html><body style="padding: 20px; text-align: center;">Please do not refresh the page...</body><script>window.location="https://cybergaming.in/fantasy-match-contests/' +
                            tournamentSlug +
                            "/" +
                            contestId +
                            '?transactionSuccess=1"</script></html>'
                    );
                    res.end();
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    } else {
        closeMongoDbConnection();
        res.set("Content-Type", "text/html");
        res.write(
            '<html><body style="padding: 20px; text-align: center;">Please do not refresh the page...</body><script>window.location="https://cybergaming.in/fantasy-match-contests/' +
                tournamentSlug +
                "/" +
                contestId +
                '?transactionFailed=1"</script></html>'
        );
        res.end();
    }
});

if (environment == "production") {
    module.exports.handler = serverless(app);
    // const handler = serverless(app);
    // module.exports.handler = async (event, context) => {
    //     // you can do other things here
    //     const result = await handler(event, context);
    //     // and here

    //     db = await connectMongoDb();
    //     console.log('Server running at http://localhost:' + (process.env.PORT || 8080));

    //     return result;
    // };
} else {
    app.listen(process.env.PORT || 8080, async () => {
        db = await connectMongoDb();
        console.log(
            "Server running at http://localhost:" + (process.env.PORT || 8080)
        );
    });
}
