const environment = process.env.NODE_ENV;

const express = require("express");
const jwt = require("jsonwebtoken");

const config = require("../env.json")[environment || "development"];
const { calculateResponseTime } = require("../middleware/apiTime");
const User = require("../models/user");

const router = express.Router();

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
                res.status(200).json({
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

module.exports = router;
