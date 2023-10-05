const jwt = require("jsonwebtoken");
const environment = process.env.NODE_ENV;
const config = require("../env.json")[environment || "development"];

const generateTokens = (user, geoData) => {
	return new Promise(async (resolve, reject) => {
		try {
			const payLoad = {
				name: user.name,
				email: user.email,
				photoUrl: user.photoUrl,
			};
			const refreshToken = jwt.sign(
				payLoad,
				config.REFRESH_TOKEN_SECRET,
				{
					expiresIn: "365d",
					audience: "/token",
					issuer: "cybergaming.in",
					subject: user._id.toString(),
				}
			);
			const accessToken = jwt.sign(payLoad, config.ACCESS_TOKEN_SECRET, {
				expiresIn: 3600,
				issuer: "cybergaming.in",
				subject: user._id.toString(),
			});
			user.tokens = user.tokens.concat({
				token: refreshToken,
				geoData,
			});
			// console.log(user);
			await user.save();
			resolve({ accessToken, refreshToken });
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = generateTokens;
