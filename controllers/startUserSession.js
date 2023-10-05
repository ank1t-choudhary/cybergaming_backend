const express = require("express");
const timeStamp = require("time-stamp");

const { calculateResponseTime } = require("../middleware/apiTime");
const ErrorLog = require("../models/errorLogs");
const {
    identifiedSessions,
    unIdentifiedSessions,
} = require("../models/session");
const accessAuth = require("../middleware/accessAuth");

const router = express.Router();

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
                    userSessions.sessions.push({
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
                    // console.log(newUserSession);
                    const obj = {
                        action,
                        timeStamp: timeStamp("YYYY/MM/DD-HH:mm:ss"),
                        tokenUsed: req.token,
                        geoData: req.body.userGeoData,
                    };
                    newUserSession.sessions =
                        newUserSession.sessions.concat(obj);
                    // console.log(typeof newUserSession.sessions);
                    await newUserSession.save(/* { validateBeforeSave: false } */);
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

module.exports = router;
