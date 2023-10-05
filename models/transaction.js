const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
        index: true,
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "match",
        index: true,
    },
    matchSlug: {
        type: String,
        required: true,
        index: true,
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "contest",
        index: true,
    },
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "participant",
        index: true,
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
    transactionToken: {
        type: String,
        required: true,
    },
    transactionId: String,
    transactionStatus: String,
    transactionDetails: mongoose.Schema.Types.Mixed,
});

const transaction = mongoose.model("transaction", transactionSchema);

module.exports = transaction;
