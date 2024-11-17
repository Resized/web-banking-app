const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    sender: {
        type: String,
        required: "Provide email of sender"
    },
    receiver: {
        type: String,
        required: "Provide email of target"
    },
    amount: {
        type: Number,
        required: "Provide an amount"
    },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Export model
module.exports = mongoose.model("Transaction", TransactionSchema);
