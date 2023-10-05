const { OAuth2Client } = require("google-auth-library");
const { calculateResponseTime } = require("./apiTime");

const validateIdToken = async (req, res, next) => {
	try {
		const CLIENT_ID =
			"546503528167-1543mimklrnv23tmhkvv8il9m5mkm66n.apps.googleusercontent.com";
		const token = req.body.idToken;
		const client = new OAuth2Client(CLIENT_ID);

		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID,
		});
		console.log("Validated");
		next();
	} catch (e) {
		res.status(400).send({ success: false });
		return calculateResponseTime(req);
	}
};
module.exports = validateIdToken;
