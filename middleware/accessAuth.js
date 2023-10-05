const jwt = require("jsonwebtoken");
const environment = process.env.NODE_ENV;
const config = require("../env.json")[environment || "development"];

const { calculateResponseTime } = require("./apiTime");

const auth = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        req.invalidate = "true"; //for sessionInitiate endpoint
        res.status(401).send();
        return calculateResponseTime(req);
    }
    const token = authHeader.replace("Bearer ", "");
    // const decoded = jwt.decode(token);
    jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        {
            issuer: "cybergaming.in",
            // subject: req.body._id,
            // subject: decoded.sub,
        },
        (err, user) => {
            if (err) {
                req.invalidate = "true";
                res.status(402).send(err);
                return calculateResponseTime(req);
            }
            req.user = user; //Contains payLoad of JWT
            req.token = token;
            if (!(req.noNext && req.noNext === "true")) next();
        }
    );
};

module.exports = auth;
