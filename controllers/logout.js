const express = require("express")
const jwt = require("jsonwebtoken")
const timeStamp = require("time-stamp");

const {
	calculateResponseTime,
} = require("../middleware/apiTime");
const User = require("../models/user");
const {
	identifiedSessions,
} = require("../models/session");

const router = express.Router()

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
	if (!sessionLogoutDetails.token)
		return;
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

module.exports = router;
