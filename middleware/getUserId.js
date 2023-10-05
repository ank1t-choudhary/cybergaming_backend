const jwt = require("jsonwebtoken");

const environment = process.env.NODE_ENV;
const config = require("../env.json")[environment || "development"];

const getUserId = async (req) => {
    // return req.headers.authorization || null;
    const authHeader = req.header("Authorization");
    if (!authHeader) return null;
    const token = authHeader.replace("Bearer ", "");

    let userId = null;
    await jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        {
            issuer: "cybergaming.in",
            // subject: req.body._id,
            // subject: decoded.sub,
        },
        (err, user) => {
            if (err) {
                userId = null;
            } else {
                userId = user.sub;
            }
        }
    );
    return userId;
};

module.exports = getUserId;
