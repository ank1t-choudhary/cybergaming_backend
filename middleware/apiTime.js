const environment = process.env.NODE_ENV;
const config = require("../env.json")[environment || "development"];
const sendMail = require("./sendMail");
const ErrorLog = require("../models/errorLogs");

const initiateApiTime = (req, res, next) => {
	req.apiStartTime = new Date().getTime();
	next();
};

const calculateResponseTime = (req) => {
	const endTime = new Date().getTime();
	const a = new Date(req.apiStartTime);
	const start =
		a.getFullYear() +
		"/" +
		(a.getMonth() + 1) +
		"/" +
		a.getDate() +
		"-" +
		a.getHours() +
		":" +
		a.getMinutes() +
		":" +
		a.getSeconds() +
		":" +
		a.getUTCMilliseconds();

	const b = new Date(endTime);
	const end =
		b.getFullYear() +
		"/" +
		(b.getMonth() + 1) +
		"/" +
		b.getDate() +
		"-" +
		b.getHours() +
		":" +
		b.getMinutes() +
		":" +
		b.getSeconds() +
		":" +
		b.getUTCMilliseconds();
	if (endTime - req.apiStartTime > config.RESPONSE_TIME)
		sendMail(
			"Fantasy Gaming: API taking excess time",
			`API: ${req.route.path.replace("/", "")}\nResponse Time: ${
				endTime - req.apiStartTime
			}ms\nStart Time: ${start}\nEnd Time: ${end} `
		).catch((e) => {
			const errorLog = new ErrorLog({
				time: new Date(),
				file: "apiTime->sendMail",
				// line: String,
				info: e,
				// type: String,
			});
			errorLog.save().catch((e) => {
				console.log(e);
			});
		});
};

module.exports = { initiateApiTime, calculateResponseTime };
