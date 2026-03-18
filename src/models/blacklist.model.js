const mongoose = require('mongoose');
const { create } = require('./transaction.model');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required"],
        unique: [true,"Token must be unique"],
    },
    BlacklistedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
},{
    timestamps: true
})

tokenBlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 3}) // tokens will be removed after 72 hours

const tokenBlacklistModel = mongoose.model("TokenBlacklist", tokenBlacklistSchema)

module.exports = tokenBlacklistModel