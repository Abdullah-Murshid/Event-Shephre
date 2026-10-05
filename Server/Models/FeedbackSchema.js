const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const feedbackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "event",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["suggestion", "issue", "general"],
        default: "general"
    }
}, { timestamps: true });

const feedbackModel = mongoose.model("feedback", feedbackSchema);
module.exports = feedbackModel;