const express = require("express");
const jwt = require("jsonwebtoken");

const createNewUser = require("../middleware/createNewUser");
const generateTokens = require("../middleware/generateTokens");
const { calculateResponseTime } = require("../middleware/apiTime");
const User = require("../models/user");
const validateAccessToken = require("../middleware/socialAuth");

const router = express.Router();

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
            res.status(200).json({
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

module.exports = router;
