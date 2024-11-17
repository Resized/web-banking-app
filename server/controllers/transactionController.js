const Balance = require("../models/balance");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");
const { cacheResponse, delCachePattern, generateTransactionKey } = require("../middleware/redis");
const { clients } = require("../utils/wsServer");

exports.viewTransactions = asyncHandler(async (req, res, next) => {
    const redis_key = generateTransactionKey(req);
    const user = req.user;
    const offset = Number(req.query.offset) || 0;
    const limit = Math.min(Number(req.query.limit) || 10, 10);

    const query = { $or: [{ sender: user.email }, { receiver: user.email }] };
    const totalTransactions = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query, { _id: 0, __v: 0 })
        .sort('-createdAt')
        .skip(offset)
        .limit(limit);

    const result = {
        total: totalTransactions,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalTransactions / limit),
        hasPrevious: offset > 0,
        hasNext: totalTransactions > offset + limit,
        transactions: transactions
    };

    console.log("cached response key: ", redis_key);
    cacheResponse(redis_key, result);
    res.status(200).json({
        status: 200,
        message: "Transactions retrieved successfully.",
        data: result
    });
});

exports.makeTransaction = asyncHandler(async (req, res, next) => {
    const sender = req.user;
    const { amount, receiver } = req.body;

    if (!amount || !receiver) {
        return res.status(400).json({
            status: 400,
            error: 'MISSING_PARAMETERS',
            message: 'Amount and target are required.'
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            status: 400,
            error: 'INVALID_AMOUNT',
            message: 'Amount must be positive.'
        });
    }

    if (sender.email === receiver) {
        return res.status(400).json({
            status: 400,
            error: 'INVALID_TRANSACTION',
            message: 'Cannot make a transaction to oneself.'
        });
    }

    const target = await User.findOne({ email: receiver });
    if (!target) {
        return res.status(400).json({
            status: 400,
            error: 'USER_NOT_FOUND',
            message: 'Target email doesn\'t exist.'
        });
    }

    if (!target.isActivated) {
        return res.status(400).json({
            status: 400,
            error: 'USER_NOT_ACTIVATED',
            message: 'Target user isn\'t activated.'
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const senderBalance = await Balance.findOne({ email: sender.email }).session(session);
        if (!senderBalance || amount > senderBalance.amount) {
            await session.abortTransaction();

            return res.status(400).json({
                status: 400,
                error: 'INSUFFICIENT_FUNDS',
                message: 'Not enough balance.'
            });
        }

        senderBalance.amount -= amount;
        await senderBalance.save({ session });
        await Balance.updateOne({ email: receiver }, { $inc: { amount: amount } }).session(session);
        const transaction = await Transaction.create([{
            amount: amount,
            sender: sender.email,
            receiver: receiver,
        }], { session });

        await session.commitTransaction();

        await Promise.all([
            delCachePattern(`${sender.email}:transactions:*`),
            delCachePattern(`${receiver}:transactions:*`)
        ]);

        const data = {
            amount: transaction[0].amount,
            sender: transaction[0].sender,
            receiver: transaction[0].receiver,
            createdAt: transaction[0].createdAt,
        };

        const receiverSocketsSet = clients.get(receiver);
        if (receiverSocketsSet) {
            for (const receiverSocket of receiverSocketsSet) {
                receiverSocket.send(JSON.stringify({
                    type: 'transaction',
                    amount: data.amount,
                    sender: data.sender,
                    receiver: data.receiver,
                    createdAt: data.createdAt
                }));
            }
        }

        res.status(201).json({
            status: 201,
            message: "Transaction successful.",
            data: data,
        });

    } catch (error) {
        await session.abortTransaction();

        res.status(500).json({
            status: 500,
            error: "TRANSACTION_FAILED",
            message: "Transaction failed.",
            details: error.message
        });
    } finally {
        session.endSession();
    }
});


// exports.notifyTransaction = asyncHandler(async (ws, req) => {
//     console.log("notifyTransaction invoked!");
//     ws.on('connection', (ws, request) => {
//         const params = new URLSearchParams(request.url.split('?')[1]);
//         const token = params.get('token');

//         if (!token) {
//             ws.close(1008, 'Missing access token');
//             return;
//         }

//         jwt.verify(token, SECRET_ACCESS_TOKEN, async (err, user) => {
//             if (err) {
//                 ws.close(1008, 'Invalid access token');
//                 return;
//             }

//             const checkIfBlacklisted = await Blacklist.findOne({ token });
//             if (checkIfBlacklisted) {
//                 ws.close(1008, 'Token blacklisted');
//                 return;
//             }

//             // Attach user information to WebSocket connection
//             ws.user = user;
//             clients.set(user.email, ws);

//             ws.on('close', () => {
//                 console.log('Client disconnected');
//                 clients.delete(user.email);
//             });
//         });
//     });
// });
