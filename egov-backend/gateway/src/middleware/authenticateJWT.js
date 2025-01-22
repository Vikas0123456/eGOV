const { MESSAGES, STATUS_CODES } = require("../utiles/constants");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../middleware/encryptDecrypt");

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (
        req.originalUrl.startsWith("/userService/user") ||
        req.originalUrl.startsWith("/userService/customer") ||
        req.originalUrl.startsWith("/documentService/document/list") ||
        req.originalUrl.startsWith("/paymentService/customerDetails") ||
        req.originalUrl.startsWith("/documentService/uploading") ||
        req.originalUrl.startsWith("/notificationtService/create") 
        ) {
        return next(); // Skip authentication for this route
    }
    if (authHeader) {
        const token = authHeader.split(" ")[1]; //remove 'Bearer ' from token
        // console.log(jwt.sign({userId: 123}, process.env.JWT_KEY, {
        //     expiresIn: "5h",
        // }));

        const tokenData = verifyToken(token);
        if (tokenData && tokenData.payload) {
            req.headers.jwtPayload = JSON.stringify(tokenData.payload);
            req.headers.jwtToken = token;
            next();
        } else {
            res.status(STATUS_CODES.UNAUTHORIZED).json(
                encrypt({
                    message: MESSAGES.INVALID_TOKEN,
                    status: STATUS_CODES.UNAUTHORIZED,
                })
            );
        }
    } else {
        res.status(STATUS_CODES.UNAUTHORIZED).json(
            encrypt({
                message: MESSAGES.AUTH_REQUIRE,
                status: STATUS_CODES.UNAUTHORIZED,
            })
        );
    }
};
const verifyToken = (token) => {
    try {
        if (!token) {
            return false;
        }
        const validate = jwt.verify(token, process.env.JWT_KEY, {
            complete: true,
        });

        if (validate) {
            return validate;
        }
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticateJWT,
};
