const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const boothSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "event",
        required: true
    },
    boothNumber: {
        type: String,
        required: true
    },
    size: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium"
    },
    locationOnFloor: {
        type: String
    },
    status: {
        type: String,
        enum: ["available", "reserved", "occupied"],
        default: "available"
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "exhibitor",
        default: null
    }
}, { timestamps: true });

const boothModel = mongoose.model("booth", boothSchema);
module.exports = boothModel;