const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['event', 'schedule', 'system'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const notificationModel = mongoose.model("notification", notificationSchema);
module.exports = notificationModel;
