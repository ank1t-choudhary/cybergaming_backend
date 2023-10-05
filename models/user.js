// require("../db/mongoose");
const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        fname: {
            type: String,
        },
        lname: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        photoUrl: {
            type: String,
            required: true,
        },
        googleId: {
            type: String,
            index: {
                unique: true,
                partialFilterExpression: { googleId: { $type: "string" } },
            },
        },
        facebookId: {
            type: String,
            index: {
                unique: true,
                partialFilterExpression: { facebookId: { $type: "string" } },
            },
        },
        googleAccessToken: {
            type: String,
        },
        facebookAccessToken: {
            type: String,
        },
        whatsappNo: {
            type: Number,
        },
        paytmNo: {
            type: Number,
        },
        walletBalance: {
            type: Number,
            required: true,
            default: 0,
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
                geoData: {
                    type: new mongoose.Schema({
                        ip: {
                            type: String,
                            required: true,
                        },
                        latitude: {
                            type: Decimal128,
                            required: true,
                        },
                        longitude: {
                            type: Decimal128,
                            required: true,
                        },
                        city: {
                            type: String,
                            required: true,
                        },
                        region: {
                            type: String,
                            required: true,
                        },
                        country: {
                            type: String,
                            required: true,
                        },
                        countryCode: {
                            type: String,
                            required: true,
                        },
                    }),
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const user = mongoose.model("user", userSchema);
// const user1 = new user({
// 	name: "Ankit",
// 	email: "choudhuuuary",
// 	imgUrl: "dnmb",
// 	googleId: "req.body.googleId",
// 	accessToken: "req.body.response.access_token",
// });
// user1.save().then((user) => {
// 	console.log(user);
// });

module.exports = user;
