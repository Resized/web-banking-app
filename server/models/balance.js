const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BalanceSchema = new Schema({
    amount: {
        type: Number,
        required: "Provide an amount"
    },
    email: {
        type: String,
        unique: true,
        required: "Provide an email"
    },
}, { timestamps: { createdAt: false, updatedAt: true } });

// Export model
module.exports = mongoose.model("Balance", BalanceSchema);
