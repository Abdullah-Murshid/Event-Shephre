const exhibitorModel = require('../Models/ExhibitorSchema')
const userModel = require('../Models/UserSchema') 
const { recalculateUserRole } = require('../utils/roleUtils')
const { sendNotification } = require('../utils/notificationHelper')
// http://localhost:3000/exhibitor/register
const registerExhibitor = async (req, res) => {
    try {
        let { userId, eventId, companyName, products, description, contactInfo, requestedBooth } = req.body
        let logo = req.file ? `/uploads/${req.file.filename}` : req.body.logo

        if (!userId || !eventId || !companyName || !products || !contactInfo) {
            return res.json({
                message: "Fields are missing",
                status: false
            })
        }

        // check exhibitor exist
        let existingExhibitor = await exhibitorModel.findOne({ userId, eventId })
        if (existingExhibitor) {
            return res.json({
                message: "Already registered for this event",
                status: false
            })
        }

        let newExhibitor = new exhibitorModel({ 
            userId, 
            eventId, 
            companyName, 
            products, 
            logo, 
            description, 
            contactInfo,
            requestedBooth: requestedBooth || ""
        })
        await newExhibitor.save()

        res.json({
            message: "Exhibitor registered successfully",
            status: true,
            data: newExhibitor
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/getall
const getAllExhibitors = async (req, res) => {
    try {
        let exhibitors = await exhibitorModel.find()
            .populate('userId', 'name email')
            .populate('eventId', 'title date')

        res.json({
            message: "Exhibitors fetched successfully",
            status: true,
            data: exhibitors
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/get/:id
const getExhibitorById = async (req, res) => {
    try {
        let { id } = req.params

        let exhibitor = await exhibitorModel.findById(id)
        if (!exhibitor) {
            return res.json({
                message: "Exhibitor not found",
                status: false
            })
        }

        res.json({
            message: "Exhibitor fetched successfully",
            status: true,
            data: exhibitor
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/update/:id
const updateExhibitor = async (req, res) => {
    try {
        let { id } = req.params
        let updateData = { ...req.body }

        if (req.file) {
            updateData.logo = `/uploads/${req.file.filename}`
        }

        let exhibitor = await exhibitorModel.findById(id)
        if (!exhibitor) {
            return res.json({
                message: "Exhibitor not found",
                status: false
            })
        }

        let updatedExhibitor = await exhibitorModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
        )

        res.json({
            message: "Exhibitor updated successfully",
            status: true,
            data: updatedExhibitor
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/delete/:id
const deleteExhibitor = async (req, res) => {
    try {
        let { id } = req.params

        let exhibitor = await exhibitorModel.findById(id)
        if (!exhibitor) {
            return res.json({
                message: "Exhibitor not found",
                status: false
            })
        }

        // Store userId before deletion
        const userId = exhibitor.userId

        // Delete the exhibitor record
        await exhibitorModel.findByIdAndDelete(id)

        // Recalculate user role
        if (userId) {
            await recalculateUserRole(userId)
        }

        res.json({
            message: "Exhibitor role removed. User is now an Attendee.",
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

// http://localhost:3000/exhibitor/approve/:id
const approveExhibitor = async (req, res) => {
    try {
        let { id } = req.params

        // step 1 - find exhibitor
        let exhibitor = await exhibitorModel.findById(id)

        // step 2 - check if exists
        if (!exhibitor) {
            return res.json({
                message: "Exhibitor not found",
                status: false
            })
        }

        // step 3 - check if already approved
        if (exhibitor.status === "approved") {
            return res.json({
                message: "Exhibitor already approved",
                status: false
            })
        }

        // step 4 - update exhibitor status
        let approvedExhibitor = await exhibitorModel.findByIdAndUpdate(
            id,
            { status: "approved" },
            { returnDocument: 'after' }
        )

        // step 5 - update user role dynamically
        await recalculateUserRole(exhibitor.userId)

        // step 5.5 - Dispatch notification
        try {
            const populatedExhibitor = await exhibitorModel.findById(id).populate('eventId');
            const eventTitle = populatedExhibitor.eventId ? populatedExhibitor.eventId.title : "the event";
            await sendNotification(req, {
                userId: exhibitor.userId,
                title: "Application Approved",
                message: `Your exhibitor registration for the event "${eventTitle}" has been approved.`,
                type: "system"
            });
        } catch (err) {
            console.error("Error dispatching exhibitor approval notification:", err.message);
        }

        // step 6 - send response
        res.json({
            message: "Exhibitor approved successfully",
            status: true,
            data: approvedExhibitor
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/reject/:id
const rejectExhibitor = async (req, res) => {
    try {
        let { id } = req.params

        let exhibitor = await exhibitorModel.findById(id)
        if (!exhibitor) {
            return res.json({
                message: "Exhibitor not found",
                status: false
            })
        }

        if (exhibitor.status === "rejected") {
            return res.json({
                message: "Exhibitor already rejected",
                status: false
            })
        }

        let rejectedExhibitor = await exhibitorModel.findByIdAndUpdate(
            id,
            { status: "rejected" },
            { returnDocument: 'after' }
        )

        // recalculate user role
        await recalculateUserRole(exhibitor.userId)

        // Dispatch notification
        try {
            const populatedExhibitor = await exhibitorModel.findById(id).populate('eventId');
            const eventTitle = populatedExhibitor.eventId ? populatedExhibitor.eventId.title : "the event";
            await sendNotification(req, {
                userId: exhibitor.userId,
                title: "Application Status Update",
                message: `Your exhibitor registration status for the event "${eventTitle}" has been updated.`,
                type: "system"
            });
        } catch (err) {
            console.error("Error dispatching exhibitor rejection notification:", err.message);
        }

        res.json({
            message: "Exhibitor rejected",
            status: true,
            data: rejectedExhibitor
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/exhibitor/search 
const searchExhibitors = async (req, res) => {
    try {
        let { search, category, eventId, status } = req.query

        let query = { status: 'approved' }

        if (eventId) {
            query.eventId = eventId
        }

        if (status) {
            query.status = status
        }

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { products: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        let exhibitors = await exhibitorModel.find(query)
            .populate('userId', 'name email')
            .populate('eventId', 'title date')
            .populate('boothId', 'boothNumber size')

        res.json({
            message: "Exhibitors fetched successfully",
            status: true,
            data: exhibitors
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

module.exports = { registerExhibitor, getAllExhibitors, getExhibitorById, updateExhibitor, deleteExhibitor, approveExhibitor, rejectExhibitor, searchExhibitors }