const User = require("../models/user");
const Balance = require("../models/balance");
const Blacklist = require("../models/blacklist");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { SECRET_ACCESS_TOKEN, SECRET_REFRESH_TOKEN } = require("../config");
const { default: mongoose } = require("mongoose");
const { secure_configuration, getConfirmEmailTemplate, transporter, getResetEmailTemplate } = require("../utils/email");
const { checkAuthToken } = require('../utils/authHelper');

exports.checkAuth = asyncHandler(async (req, res, next) => {
    try {
        const user = await checkAuthToken(req.headers['authorization']);
        req.user = user;
        next();
    } catch (error) {
        res.status(error.status).json({
            error: error.error,
            message: error.message,
            details: error.details
        });
    }
});


exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, confirmationCode } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findOne({ email, confirmationCode }).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(400).json({
                status: 400,
                error: "INVALID_CODE",
                message: "Confirmation code is invalid or user not found.",
                details: "The confirmation code provided is incorrect or the user does not exist."
            });
        }

        user.acceptConfirmationCode();
        await user.save({ session });

        await Balance.create([{
            amount: Math.floor(Math.random() * 1000) + 1000,
            email: user.email,
        }], { session });

        await session.commitTransaction();

        res.status(200).json({
            status: 200,
            message: "Email confirmed successfully."
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({
            status: 500,
            error: "SERVER_ERROR",
            message: "An error occurred while confirming email.",
            details: err.message
        });
    } finally {
        session.endSession();
    }

});

exports.register = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
        return res.status(400).json({
            status: 400,
            error: "EMAIL_TAKEN",
            message: "Email is already registered.",
            details: "User must provide a valid unique email address."
        });
    }

    const user = await User.create({ email, password })
        .catch(error => {
            return res.status(500).json({
                status: 500,
                error: "REGISTRATION_FAILED",
                message: "User registration failed.",
                details: error.message
            });
        });

    const mailConfigurations = {
        from: secure_configuration.EMAIL_USERNAME,
        to: email,
        subject: 'Email Verification WebBankingApp',
        html: getConfirmEmailTemplate(user.confirmationCode),
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({
                status: 500,
                error: "EMAIL_FAILED",
                message: "Failed to send confirmation email.",
                details: error.message
            });
        } else {
            console.log('Email Sent Successfully');
        }
    });

    res.status(201).json({
        status: 201,
        message: "Registered successfully.",
        data: { email }
    });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(400).json({
            status: 400,
            error: "INVALID_USER",
            message: "User does not exist.",
            details: "The user account must be registered and activated."
        });
    }

    if (!user.isActivated) {
        return res.status(400).send({
            status: 400,
            error: "USER_NOT_ACTIVATED",
            message: "User isn't activated.",
            details: "The user account must be activated via confirmation code before proceeding."
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const accessToken = user.generateAccessJWT();
        const refreshToken = user.generateRefreshJWT();
        await user.save(); // Save the user with the new refresh token

        res.status(200).json({
            status: 200,
            message: "Logged in successfully.",
            accessToken,
            refreshToken,
        });
    } else {
        res.status(400).json({
            status: 400,
            error: "INVALID_CREDENTIALS",
            message: "Invalid credentials.",
            details: "User provided wrong credentials."
        });
    }
});


exports.refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.headers['x-refresh-token'];
    console.log("refreshToken: ", refreshToken);

    if (!refreshToken) {
        return res.status(401).json({
            status: 401,
            message: "Refresh token is required."
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, SECRET_REFRESH_TOKEN);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                status: 401,
                error: "INVALID_REFRESH_TOKEN",
                message: "Invalid refresh token provided.",
                details: "User must provide a valid token."
            });
        }

        const newAccessToken = user.generateAccessJWT();
        const newRefreshToken = user.generateRefreshJWT();
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "Refresh token issued successfuly.",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: "SERVER_ERROR",
            message: "Unknown server error.",
            details: "Unknown server error occured."
        });
    }
});

exports.logout = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(200).json({
            status: 200,
            message: "Logged out already.",
        });
    }

    const accessToken = authHeader.split(' ')[1];
    const refreshToken = req.headers['x-refresh-token'];

    // If no tokens are found, return a message
    if (!accessToken && !refreshToken) {
        return res.status(200).json({
            status: 200,
            message: "Logged out already.",
        });
    }

    try {
        if (accessToken) {
            const decoded = jwt.verify(accessToken, SECRET_ACCESS_TOKEN);
            const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
            if (!checkIfBlacklisted) {
                await Blacklist.create({ token: accessToken, expiresAt: new Date(decoded.exp * 1000) });
            }
        }

        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, SECRET_REFRESH_TOKEN);
            const user = await User.findById(decoded.id).select('+refreshToken');

            if (user && user.refreshToken === refreshToken) {
                user.clearRefreshJWT();
                await user.save();
            }
        }

        res.status(200).json({
            status: 200,
            message: "Logged out successfully.",
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message,
            message: "Error logging out.",
            details: "Server encountered an error during logout."
        });
    }
});

exports.requestPasswordReset = asyncHandler(async (req, res, next) => {
    const email = req.body?.email;

    if (!email) {
        return res.status(400).json({
            status: 400,
            error: "EMAIL_MISSING",
            message: "Must provide email.",
        });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isActivated) {
        return res.status(400).json({
            status: 400,
            error: "INVALID_USER",
            message: "User doesn't exist or isn't activated.",
        });
    }

    user.generateResetPasswordCode();
    await user.save();

    const mailConfigurations = {
        from: secure_configuration.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset WebBankingApp',
        html: getResetEmailTemplate(user.resetPasswordCode),
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({
                status: 500,
                error: "EMAIL_FAILED",
                message: "Failed to send confirmation email.",
                details: error.message
            });
        } else {
            console.log('Email Sent Successfully');
        }
    });

    res.status(200).json({
        status: 200,
        message: "Password reset token sent to email.",
    });

});

exports.confirmPasswordReset = asyncHandler(async (req, res, next) => {
    const { email, token, password } = req.body

    if (!token || !password) {
        return res.status(400).json({
            status: 400,
            error: "TOKEN_OR_PASSWORD_MISSING",
            message: "Must provide both token and new password.",
        });
    }

    if (!email) {
        return res.status(400).json({
            status: 400,
            error: "EMAIL_MISSING",
            message: "Must provide email.",
        });
    }

    const user = await User.findOne({ email, resetPasswordCode: token });

    if (!user) {
        return res.status(400).json({
            status: 400,
            error: "INVALID_TOKEN_OR_EMAIL",
            message: "Invalid email or reset token.",
        });
    }

    if (user.resetPasswordExpiry && user.resetPasswordExpiry < Date.now()) {
        return res.status(400).json({
            status: 400,
            error: "TOKEN_EXPIRED",
            message: "Reset token has expired.",
        });
    }

    user.acceptResetPasswordCode(password);
    await user.save();

    res.status(200).json({
        status: 200,
        message: "Password has been reset successfully.",
    });

});