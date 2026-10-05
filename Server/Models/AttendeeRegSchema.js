const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const attendeeRegSchema = new Schema({
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
    registeredSessions: [
        {
            sessionIndex: Number,
            title: String,
            startTime: Date
        }
    ],
    bookmarks: [
        {
            type: Schema.Types.ObjectId,
            ref: "event"
        }
    ],
    bookmarkedSessions: [String],
    isRegistered: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const attendeeRegModel = mongoose.model("attendeeReg", attendeeRegSchema);
module.exports = attendeeRegModel;