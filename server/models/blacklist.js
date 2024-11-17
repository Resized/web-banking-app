const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    }
}, { timestamps: true });

// Export model
module.exports = mongoose.model("Blacklist", BlacklistSchema);
