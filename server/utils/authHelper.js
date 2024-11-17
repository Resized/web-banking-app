const jwt = require('jsonwebtoken');
const Blacklist = require('../models/blacklist');
const { SECRET_ACCESS_TOKEN } = require('../config');

const checkAuthToken = async (authorizationHeader) => {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw {
            status: 401,
            error: "MISSING_TOKEN",
            message: "Access token is missing or invalid."
        };
    }

    const accessToken = authorizationHeader.split(' ')[1];

    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    if (checkIfBlacklisted) {
        throw {
            status: 401,
            error: "SESSION_EXPIRED",
            message: "Session expired, please log in.",
            details: "The token provided has been expired, user needs to log in again."
        };
    }

    try {
        const user = jwt.verify(accessToken, SECRET_ACCESS_TOKEN);
        return user;
    } catch (err) {
        throw {
            status: 401,
            error: "INVALID_TOKEN",
            message: "Token provided is invalid.",
            details: "User must provide a valid token to access this resource."
        };
    }
};

module.exports = { checkAuthToken };
