const express = require("express");

const { calculateResponseTime } = require("../middleware/apiTime");
const auth = require("../middleware/accessAuth");
const getUserId = require("../middleware/getUserId");
const User = require("../models/user");

const router = express.Router();

router.patch("/updateUserProfile", auth, async (req, res) => {
    try {
        // console.log("Here");
        const { name, whatsappNo, paytmNo } = req.body;
        const userId = await getUserId(req);
        const user = await User.findById(userId);

        // Manually setting the fields to force validation
        user.name = name;
        user.fname = name ? name.split(' ')[0] : '';
        user.lname = name && name.split(' ').length>1 ? name.split(' ')[name.split(' ').length-1] : '';
        user.whatsappNo = whatsappNo;
        user.paytmNo = paytmNo;

        await user.save();
        res.status(200).json({ success: true });
        calculateResponseTime(req);
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
        calculateResponseTime(req);
    }
});

module.exports = router;
