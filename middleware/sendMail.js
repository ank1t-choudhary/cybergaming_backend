// --------------------KEEP THIS----------------------------------
// const environment = process.env.NODE_ENV;
// const config = require("../env.json")[environment || "development"];

// const nodemailer = require("nodemailer");

// const sendMail = async (mailSub, mailBody) => {
// 	const transporter = nodemailer.createTransport({
// 		host: config.EMAIL_HOST,
// 		port: 465,
// 		secure: true,
// 		auth: {
// 			user: config.EMAIL_ID,
// 			pass: config.PASSWORD,
// 		},
// 		tls: {
// 			rejectUnauthorized: false,
// 		},
// 	});
// 	const mailInfo = await transporter.sendMail({
// 		from: "'Cyber Gaming' <support@cybergaming.in>",
// 		to: config.MAIL_RECIEVER,
// 		subject: mailSub,
// 		text: mailBody,
// 		html: "",
// 	});
// 	console.log("Mail Sent. Msg id :" + mailInfo.messageId);
// };

// module.exports = sendMail;

// ---------------------Temporarily Sending Mail from Gmail-----------------
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { Module } = require("module");

const CLIENT_ID =
	"648253778339-88u3fparqnseqghtnujnl34vtgissfof.apps.googleusercontent.com";
const CLIENT_SECRET = "2ol2qP84dAKKXZ7So-b_9Lm4";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
	"1//04_sNKaABlwNhCgYIARAAGAQSNwF-L9IrfOa-3RW8tJoX1Z3oUMON-6iIcO-rufjM2p3-3Hc0YXR9TGWpvkk11TQJaYoBoJjmEXE";
const G_MAIL = "ankit.iiitg@gmail.com";
const RECIEVER = "ankit.choudhary.iiitg@gmail.com,ikomalchandra@gmail.com";

const oAuthClient = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI
);
oAuthClient.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMail = async (mailSub, mailBody) => {
	const accessToken = await oAuthClient.getAccessToken();
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: G_MAIL,
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			refreshToken: REFRESH_TOKEN,
			accessToken: accessToken,
		},
	});
	const mailInfo = await transporter.sendMail({
		from: "'Ankit' <ankit.iiitg@gmail.com>",
		to: RECIEVER,
		subject: mailSub,
		text: mailBody,
		html: "",
	});
	console.log(mailInfo.messageId);
};

module.exports = sendMail;
