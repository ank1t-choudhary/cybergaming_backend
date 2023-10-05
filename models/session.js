const { Double } = require("mongodb");
const mongoose = require("mongoose");

const identifiedSessionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    sessions: [
        {
            action: {
                type: String,
                required: true,
            },
            timeStamp: {
                type: String,
                required: true,
            },
            tokenUsed: {
                type: String,
                required: true,
            },
            geoData: {
                type: new mongoose.Schema({
                    ip: {
                        type: String,
                        // required: true,
                    },
                    latitude: {
                        type: mongoose.Schema.Types.Decimal128,
                        // required: true,
                    },
                    longitude: {
                        type: mongoose.Schema.Types.Decimal128,
                        // required: true,
                    },
                    city: {
                        type: String,
                        // required: true,
                    },
                    region: {
                        type: String,
                        // required: true,
                    },
                    country: {
                        type: String,
                        // required: true,
                    },
                    countryCode: {
                        type: String,
                        // required: true,
                    },
                }),
            },
        },
    ],
});
const unIdentifiedSessionSchema = new mongoose.Schema({
    timeStamp: {
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
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },
            longitude: {
                type: mongoose.Schema.Types.Decimal128,
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
});

const identifiedSessions = mongoose.model(
    "identified-session",
    identifiedSessionSchema
);
const unIdentifiedSessions = mongoose.model(
    "unidentified-session",
    unIdentifiedSessionSchema
);

module.exports = { identifiedSessions, unIdentifiedSessions };
