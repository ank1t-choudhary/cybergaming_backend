const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const auth = require("../middleware/accessAuth");
const getUserId = require("../middleware/getUserId");
const User = require("../models/user");

const router = express.Router();

router.get("/getUserProfile", auth, async (req, res) => {
    try {
        const userId = await getUserId(req);
        const user = await User.findById(userId).select({
            tokens: 0,
            facebookAccessToken: 0,
            googleAccessToken: 0,
            facebookId: 0,
            googleId: 0,
            whatsappNo: 0,
            paytmNo: 0,
        });

        res.status(200).json({ success: true, result: user });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e, result: {} });
        calculateResponseTime(req);
    }
});

module.exports = router;
