const environment = process.env.NODE_ENV;
// const environment = 'production';

const config = require("../env.json")[environment || "development"];

const express = require("express");
const Paytm = require("paytm-pg-node-sdk");
const PaytmChecksum = require("paytmchecksum");
const https = require("https");

const { calculateResponseTime } = require("../middleware/apiTime");
const getUserId = require("../middleware/getUserId");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Contest = require("../models/contest");
const auth = require("../middleware/accessAuth");

const router = express.Router();

router.post("/joinFantasyContest", auth, async (req, res) => {
    try {
        const { matchId, matchSlug, contestId, recordId } = req.body;

        const userId = await getUserId(req);
        const user = await User.findById(userId);
        const orderId =
            "CG-" +
            userId +
            "-" +
            new Date().getTime() +
            "-" +
            Math.floor(Math.random() * 987654 + 873451)
                .toString(36)
                .substring(0, 4);

        const contest = await Contest.findById(contestId);
        const transactionAmount = contest.entryFee;

        /*
         * import checksum generation utility
         * You can get this utility from https://developer.paytm.com/docs/checksum/
         */

        var paytmParams = {};
        paytmParams.body = {
            requestType: "Payment",
            mid: config.PAYTM_MID,
            websiteName: config.PAYTM_WEBSITE,
            orderId: orderId,
            callbackUrl:
                config.API_BASE + "joinFantasyContestTransactionCallback",
            txnAmount: {
                value: transactionAmount.toString(),
                currency: "INR",
            },
            userInfo: {
                custId: user._id,
                email: user.email,
                firstName: user.fName,
                lastName: user.lName,
                mobile: user.whatsappNo,
            },
        };

        /*
         * Generate checksum by parameters we have in body
         * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
         */
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
                path:
                    "/theia/api/v1/initiateTransaction?mid=" +
                    config.PAYTM_MID +
                    "&orderId=" +
                    orderId,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": post_data.length,
                },
            };

            var response = "";
            var post_req = https.request(options, async function (post_res) {
                post_res.on("data", function (chunk) {
                    response += chunk;
                });

                post_res.on("end", async function () {
                    response = JSON.parse(response);

                    const transaction = new Transaction({
                        orderId,
                        matchId,
                        matchSlug,
                        contestId,
                        recordId,
                        userId,
                        transactionToken: response.body.txnToken,
                        amount: transactionAmount,
                    });
                    await transaction.save();

                    let paytmForm = `
                <form method="post" action="https://${config.PAYTM_PAYMENT_URL}/theia/api/v1/showPaymentPage?mid=${config.PAYTM_MID}&orderId=${orderId}" name="paytm">
                    <table border="1">
                        <tbody>
                            <input type="hidden" name="mid" value="${config.PAYTM_MID}">
                                <input type="hidden" name="orderId" value="${orderId}">
                                <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                        </tbody>
                    </table>
                    <script type="text/javascript"> document.paytm.submit(); </script>
                </form>`;

                    res.json({ success: true, paytmForm: paytmForm });
                });
            });

            post_req.write(post_data);
            post_req.end();
            calculateResponseTime(req);
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
        calculateResponseTime(req);
    }
});

module.exports = router;
