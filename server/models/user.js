const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { SECRET_ACCESS_TOKEN, SECRET_REFRESH_TOKEN } = require("../config");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: "Your email is required",
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: "Your password is required",
        select: false,
        max: 25,
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    confirmationCode: {
        type: String,
    },
    confirmationCodeExpires: {
        type: Date,
        expires: '24h',
    },
    resetPasswordCode: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    },
    refreshToken: {
        type: String,
        select: false,
    }

}, {
    timestamps: true,
    methods: {
        generateAccessJWT() {
            const payload = {
                id: this._id,
                email: this.email
            };
            return jwt.sign(payload, SECRET_ACCESS_TOKEN, { expiresIn: '30m' });
        },
        generateRefreshJWT() {
            const payload = {
                id: this._id,
            };
            const token = jwt.sign(payload, SECRET_REFRESH_TOKEN, { expiresIn: '7d' });
            this.refreshToken = token;
            return token;
        },
        clearRefreshJWT() {
            this.refreshToken = undefined;
        },
        generateConfirmationCode() {
            const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            this.confirmationCode = code;
            this.confirmationCodeExpires = Date.now();
            return code;
        },
        acceptConfirmationCode() {
            this.isActivated = true;
            this.confirmationCode = undefined;
            this.confirmationCodeExpires = undefined;
        },
        generateResetPasswordCode() {
            const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            this.resetPasswordCode = code;
            this.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
            return code;
        },
        acceptResetPasswordCode(password) {
            this.password = password;
            this.resetPasswordCode = undefined;
            this.resetPasswordExpiry = undefined;
        },
    }
});

UserSchema.pre("save", async function () {
    const user = this;

    if (!user.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
    } catch (error) {
        throw error;
    }

    // Generate and save confirmation code if not already set
    if (!user.confirmationCode && !user.isActivated) {
        user.generateConfirmationCode();
    }
});


// Export model
module.exports = mongoose.model("User", UserSchema);
