const Balance = require("../models/balance");
const asyncHandler = require("express-async-handler");

exports.viewBalance = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const balance = await Balance.findOne({ email: user.email })

    res.status(200).json({
        status: 200,
        message: "Balance retrieved successfully.",
        data: {
            amount: balance.amount,
            email: user.email
        }
    });
});