const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const exhibitorSchema = new Schema({
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
    companyName: {
        type: String,
        required: true
    },
    products: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    description: {
        type: String
    },
    contactInfo: {
        type: String,
        required: true
    },
    boothId: {
        type: Schema.Types.ObjectId,
        ref: "booth",
        default: null
    },
    requestedBooth: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

const exhibitorModel = mongoose.model("exhibitor", exhibitorSchema);
module.exports = exhibitorModel;