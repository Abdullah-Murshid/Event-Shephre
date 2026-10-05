const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    expoId: {
        type: Schema.Types.ObjectId,
        ref: "event",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const messageModel = mongoose.model("message", messageSchema);
module.exports = messageModel;