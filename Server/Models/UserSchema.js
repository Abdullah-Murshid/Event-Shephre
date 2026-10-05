const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "exhibitor", "attendee"],  
        default: "attendee"                         
    },
     resetToken: { type: String },

    resetTokenExpiry: { type: Date }
    
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;