const https = require("https");
const { calculateResponseTime } = require("./apiTime");

const validateAccessToken = async (req, res, next) => {
	try {
		const APP_ID = "391350831260556";
		const APP_SECRET = "458159818dd2056bd8a6cc66edacb762";
		const token = req.body.authToken;

		const url =
			"https://graph.facebook.com/debug_token?input_token=" +
			token +
			"&access_token=" +
			APP_ID +
			"|" +
			APP_SECRET;

		https.get(url, (response) => {
			let data = "";
			response.on("data", (chunk) => {
				data += chunk;
			});
			response.on("end", () => {
				const resObj = JSON.parse(data);

				if (resObj.data && resObj.data.user_id) {
					if (!resObj.data.error) {
						console.log("Validated");
						return next();
					}
					console.log("Token Expired");
					res.status(400);
					res.send(resObj.data.error);
					return calculateResponseTime(req);
				} else if (resObj.data) {
					console.log("Invalid Access Token");
					res.status(400);
					res.send(resObj.data.error);
					return calculateResponseTime(req);
				} else {
					console.log("Invalid Access Token");
					res.status(400);
					res.send(resObj.data.error);
					return calculateResponseTime(req);
				}
			});
			response.on("error", (e) => {
				console.log("Error: " + e);
				res.status(500).send({ success: false });
				calculateResponseTime(req);
			});
		});
	} catch (e) {
		res.status(500).send({ success: false });
		calculateResponseTime(req);
	}
};
module.exports = validateAccessToken;
