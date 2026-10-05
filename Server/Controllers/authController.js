const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const userModel = require('../Models/UserSchema')


// http://localhost:3000/auth/signup
const signUp = async (req, res) => {
    try {
        let { name, email, password, role } = req.body

        if (!name || !email || !password) {
            res.json({
                message: "Fields are missing",
                status: false
            })
        }

        let existingUser = await userModel.findOne({ email })
        if (existingUser) {
            res.json({
                message: "Email already exists",
                status: false
            })
        }

        let hashPassword = await bcrypt.hash(password, 10)


        let newUser = new userModel({ name, email, password: hashPassword, role })
        await newUser.save()

        res.json({
            message: "User created successfully",
            status: true,
            data: newUser
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        let { email, password } = req.body

        if (!email || !password) {
            res.json({
                message: "Fields are missing",
                status: false
            })
        }

        let user = await userModel.findOne({ email })
        if (!user) {
            res.json({
                message: "User not found",
                status: false
            })
        }

        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.json({
                message: "Invalid password",
                status: false
            })
        }
    
        let token = jwt.sign({ _id: user._id }, process.env.JWTKEY, { expiresIn: '1h' })

        res.cookie("token",token)
        res.json({
            message: "Login successful",
            status: true,
            data: user
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const sendEmail = async (to, subject, html) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await transporter.sendMail({ from: process.env.EMAIL, to, subject, html })
}


// POST /auth/forgot-password  
const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body

        if (!email) {
            return res.json({ message: "Email is required", status: false })
        }

        let user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ message: "User not found", status: false })
        }

      
        let otp = crypto.randomInt(100000, 999999).toString()

        
        user.resetToken = otp
        user.resetTokenExpiry = Date.now() + 2 * 60 * 1000  
        await user.save()

        // Send OTP via email
        await sendEmail(
            user.email,
            'Password Reset OTP',
            `
                <h2>Password Reset OTP</h2>
                <p>Your OTP for password reset is:</p>
                <h1 style="letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
                <p>This OTP expires in <b>10 minutes</b>. Do not share it with anyone.</p>
            `
        )

        res.json({ message: "OTP sent to your email", status: true })

    } catch (error) {
        res.json({ message: "Something went wrong", status: false, error: error.message })
    }
}


// POST /auth/verify-otp 
const verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body

        if (!email || !otp) {
            return res.json({ message: "Email and OTP are required", status: false })
        }

        let user = await userModel.findOne({
            email,
            resetToken: otp,
            resetTokenExpiry: { $gt: Date.now() }  
        })

        if (!user) {
            return res.json({ message: "Invalid or expired OTP", status: false })
        }

        res.json({ message: "OTP verified successfully", status: true })

    } catch (error) {
        res.json({ message: "Something went wrong", status: false, error: error.message })
    }
}


// POST /auth/reset-password  →
const resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body

        if (!email || !otp || !newPassword) {
            return res.json({ message: "All fields are required", status: false })
        }

        let user = await userModel.findOne({
            email,
            resetToken: otp,
            resetTokenExpiry: { $gt: Date.now() }  
        })

        if (!user) {
            return res.json({ message: "Invalid or expired OTP", status: false })
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 10)

        // Clear OTP fields
        user.resetToken = undefined
        user.resetTokenExpiry = undefined

        await user.save()

        res.json({ message: "Password reset successful", status: true })

    } catch (error) {
        res.json({ message: "Something went wrong", status: false, error: error.message })
    }
}


module.exports = { signUp, login, forgotPassword, verifyOtp, resetPassword }