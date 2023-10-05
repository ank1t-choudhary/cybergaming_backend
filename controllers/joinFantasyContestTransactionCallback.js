const environment = process.env.NODE_ENV;
// const environment = 'production';

const config = require("../env.json")[environment || "development"];

const express = require("express");
const Paytm = require("paytm-pg-node-sdk");
const PaytmChecksum = require("paytmchecksum");
const https = require("https");

const { calculateResponseTime } = require("../middleware/apiTime");
const Participant = require("../models/participant");
const Transaction = require("../models/transaction");

const router = express.Router();

router.post("/joinFantasyContestTransactionCallback", async (req, res) => {
    try {
        const data = req.body;
        const orderId = data.ORDERID;
        const paytmChecksum = data.CHECKSUMHASH;
        // console.log(data);

        const transaction = await Transaction.findOne({ orderId });
        const { matchSlug, contestId, recordId } = transaction;

        var isVerifySignature = await PaytmChecksum.verifySignature(
            data,
            config.PAYTM_KEY,
            paytmChecksum
        );
        if (isVerifySignature) {
            var paytmParams = {};
            paytmParams.body = {
                mid: config.PAYTM_MID,
                orderId: orderId,
            };

            PaytmChecksum.generateSignature(
                JSON.stringify(paytmParams.body),
                config.PAYTM_KEY
            ).then(async function (checksum) {
                paytmParams.head = {
                    signature: checksum,
                };

                var post_data = JSON.stringify(paytmParams);
                var options = {
                    hostname: config.PAYTM_PAYMENT_URL,
                    port: 443,
                    path: "/v3/order/status",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": post_data.length,
                    },
                };

                // Set up the request
                var response = "";
                var post_req = https.request(
                    options,
                    async function (post_res) {
                        post_res.on("data", function (chunk) {
                            response += chunk;
                        });

                        post_res.on("end", async function () {
                            response = JSON.parse(response);

                            if (
                                response &&
                                response.body &&
                                response.body.resultInfo &&
                                response.body.resultInfo.resultStatus ===
                                    "TXN_SUCCESS"
                            ) {
                                transaction.transactionId = response.body.txnId;
                                transaction.transactionDetails = response.body;
                                transaction.amount = response.body.txnAmount;
                                transaction.transactionStatus =
                                    response.body.resultInfo.resultStatus;

                                await transaction.save();

                                const participant = await Participant.findById(
                                    recordId
                                );
                                participant.isJoined = true;
                                participant.amount = response.body.txnAmount;
                                participant.orderId = orderId;
                                participant.transaction = transaction._id;
                                await participant.save();
                            } else {
                                transaction.transactionStatus =
                                    (response &&
                                        response.body &&
                                        response.body.resultInfo &&
                                        response.body.resultInfo
                                            .resultStatus) ||
                                    "FAILED";
                                await transaction.save();
                            }

                            res.set("Content-Type", "text/html");
                            res.write(
                                '<html><body style="padding: 20px; text-align: center;">Please do not refresh the page...</body><script>window.location="https://cybergaming.in/fantasy-match-contests/' +
                                    matchSlug +
                                    "/" +
                                    contestId +
                                    '?transactionSuccess=1"</script></html>'
                            );
                            res.end();
                        });
                    }
                );

                // post the data
                post_req.write(post_data);
                post_req.end();
                calculateResponseTime(req);
            });
        } else {
            res.set("Content-Type", "text/html");
            res.write(
                '<html><body style="padding: 20px; text-align: center;">Please do not refresh the page...</body><script>window.location="https://cybergaming.in/fantasy-match-contests/' +
                    matchSlug +
                    "/" +
                    contestId +
                    '?transactionFailed=1"</script></html>'
            );
            res.end();
            calculateResponseTime(req);
        }
    } catch (e) {
        res.set("Content-Type", "text/html");
        res.write(
            '<html><body style="padding: 20px; text-align: center;">Please do not refresh the page...</body><script>window.location="https://cybergaming.in?transactionFailed=1"</script></html>'
        );
        res.end();
        calculateResponseTime(req);
    }
});

module.exports = router;
