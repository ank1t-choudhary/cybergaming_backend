const googleAuth = require("./googleAuth");
const facebookAuth = require("./facebookAuth");
const { calculateResponseTime } = require("./apiTime");

const validateToken = async (req, res, next) => {
	if (!req.body.provider) {
		res.status(400).json({
			success: false,
			message: "provider is missing",
		});
		return calculateResponseTime(req);
	}
	if (req.body.provider === "GOOGLE") {
		googleAuth(req, res, next);
	} else if (req.body.provider === "FACEBOOK") {
		facebookAuth(req, res, next);
	} else {
		res.status(400).json({
			success: false,
			message: "invalid provider",
		});
		return calculateResponseTime(req);
	}
};
module.exports = validateToken;
