const User = require("../models/user");
const jwt = require("jsonwebtoken");

const createNewUser = async (req) => {
	try {
		if (req.body.provider === "GOOGLE") {
			const decoded = jwt.decode(req.body.idToken, {
				complete: true,
			});
			const user = new User({
				name: decoded.payload.name,
				fname: decoded.payload.given_name,
				lname: decoded.payload.family_name,
				email: decoded.payload.email,
				photoUrl: decoded.payload.picture,
				googleId: decoded.payload.sub,
				googleAccessToken: req.body.accessToken,
			});
			await user.save();
			return { success: "true", user };
		} else {
			const user = new User({
				name: req.body.name,
				fname: req.body.fname,
				lname: req.body.lname,
				email: req.body.email,
				photoUrl: req.body.photoUrl,
				facebookId: req.body.id,
				facebookAccessToken: req.body.authToken,
			});
			await user.save();
			return { success: "true", user };
		}
	} catch (e) {
		console.log(e);
		return { success: "false", error: e };
	}
};
module.exports = createNewUser;
