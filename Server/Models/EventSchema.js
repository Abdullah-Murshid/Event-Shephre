const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    theme: {
        type: String
    },
    banner: {
        type: String
    },
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        default: "upcoming"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    schedule: [
        {
            title: {
                type: String,
                required: true
            },
            topic: {
                type: String,
                required: true
            },
            speaker: {
                type: String,
                required: true
            },
            location: {
                type: String,
                required: true
            },
            startTime: {
                type: String,
                required: true
            },
            endTime: {
                type: String,
                required: true
            },
            capacity: {
                type: Number,
                required: true
            }
        }
    ]
}, { timestamps: true });

const eventModel = mongoose.model("event", eventSchema);
module.exports = eventModel;