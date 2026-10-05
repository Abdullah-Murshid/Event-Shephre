const boothModel = require('../Models/BoothSchema')
const exhibitorModel = require('../Models/ExhibitorSchema')
const { sendNotification } = require('../utils/notificationHelper')

// http://localhost:3000/booth/create
const createBooth = async (req, res) => {
    try {
        let { eventId, boothNumber, size, locationOnFloor } = req.body

        if (!eventId || !boothNumber) {
            return res.json({
                message: "Fields are missing",
                status: false
            })
        }

        let newBooth = new boothModel({ eventId, boothNumber, size, locationOnFloor })
        await newBooth.save()

        res.json({
            message: "Booth created successfully",
            status: true,
            data: newBooth
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/booth/getall
const getAllBooths = async (req, res) => {
    try {
        let booths = await boothModel.find()
            .populate('eventId', 'title date')
            .populate({
                path: 'assignedTo',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })

        res.json({
            message: "Booths fetched successfully",
            status: true,
            data: booths
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/booth/get/:id
const getBoothById = async (req, res) => {
    try {
        let { id } = req.params

        let booth = await boothModel.findById(id)
        if (!booth) {
            return res.json({
                message: "Booth not found",
                status: false
            })
        }

        res.json({
            message: "Booth fetched successfully",
            status: true,
            data: booth
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/booth/update/:id
const updateBooth = async (req, res) => {
    try {
        let { id } = req.params

        let booth = await boothModel.findById(id)
        if (!booth) {
            return res.json({
                message: "Booth not found",
                status: false
            })
        }

        let updatedBooth = await boothModel.findByIdAndUpdate(
            id,
            req.body,
            { returnDocument: 'after' }
        )

        // If booth is assigned, notify the exhibitor
        if (updatedBooth.assignedTo) {
            try {
                const exhibitorObj = await exhibitorModel.findById(updatedBooth.assignedTo);
                if (exhibitorObj && exhibitorObj.userId) {
                    await sendNotification(req, {
                        userId: exhibitorObj.userId,
                        title: "New Schedule Lock",
                        message: "Your exhibition booth coordinates have been locked in.",
                        type: "schedule"
                    });
                }
            } catch (err) {
                console.error("Error dispatching booth update notification:", err.message);
            }
        }

        res.json({
            message: "Booth updated successfully",
            status: true,
            data: updatedBooth
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/booth/delete/:id
const deleteBooth = async (req, res) => {
    try {
        let { id } = req.params

        let booth = await boothModel.findById(id)
        if (!booth) {
            return res.json({
                message: "Booth not found",
                status: false
            })
        }

        await boothModel.findByIdAndDelete(id)

        res.json({
            message: "Booth deleted successfully",
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

// http://localhost:3000/booth/assign/:id
const assignBooth = async (req, res) => {
    try {
        let { id } = req.params
        let { exhibitorId } = req.body

        let booth = await boothModel.findById(id)
        if (!booth) {
            return res.json({
                message: "Booth not found",
                status: false
            })
        }

        if (booth.status === "occupied") {
            return res.json({
                message: "Booth is already occupied",
                status: false
            })
        }

        let assignedBooth = await boothModel.findByIdAndUpdate(
            id,
            { assignedTo: exhibitorId, status: "occupied" },
            { returnDocument: 'after' }
        )

        // Link booth to exhibitor
        try {
            await exhibitorModel.findByIdAndUpdate(exhibitorId, { boothId: id });
        } catch (err) {
            console.error("Failed to link booth to exhibitor:", err.message);
        }

        // Dispatch notification
        try {
            const exhibitorObj = await exhibitorModel.findById(exhibitorId);
            if (exhibitorObj && exhibitorObj.userId) {
                await sendNotification(req, {
                    userId: exhibitorObj.userId,
                    title: "New Schedule Lock",
                    message: "Your exhibition booth coordinates have been locked in.",
                    type: "schedule"
                });
            }
        } catch (err) {
            console.error("Error dispatching booth assignment notification:", err.message);
        }

        res.json({
            message: "Booth assigned successfully",
            status: true,
            data: assignedBooth
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

module.exports = { createBooth, getAllBooths, getBoothById, updateBooth, deleteBooth, assignBooth }