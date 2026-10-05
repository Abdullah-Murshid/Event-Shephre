const feedbackModel = require('../Models/FeedbackSchema')

// http://localhost:3000/feedback/create
const createFeedback = async (req, res) => {
    try {
        let { userId, eventId, message, type } = req.body

        if (!userId || !eventId || !message) {
            return res.json({
                message: "Fields are missing",
                status: false
            })
        }

        let newFeedback = new feedbackModel({ userId, eventId, message, type })
        await newFeedback.save()

        res.json({
            message: "Feedback submitted successfully",
            status: true,
            data: newFeedback
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/feedback/getall
const getAllFeedback = async (req, res) => {
    try {
        let feedbacks = await feedbackModel.find()

        res.json({
            message: "Feedback fetched successfully",
            status: true,
            data: feedbacks
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/feedback/get/:id
const getFeedbackById = async (req, res) => {
    try {
        let { id } = req.params

        let feedback = await feedbackModel.findById(id)
        if (!feedback) {
            return res.json({
                message: "Feedback not found",
                status: false
            })
        }

        res.json({
            message: "Feedback fetched successfully",
            status: true,
            data: feedback
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/feedback/delete/:id
const deleteFeedback = async (req, res) => {
    try {
        let { id } = req.params

        let feedback = await feedbackModel.findById(id)
        if (!feedback) {
            return res.json({
                message: "Feedback not found",
                status: false
            })
        }

        await feedbackModel.findByIdAndDelete(id)

        res.json({
            message: "Feedback deleted successfully",
            status: true
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

module.exports = { createFeedback, getAllFeedback, getFeedbackById, deleteFeedback }