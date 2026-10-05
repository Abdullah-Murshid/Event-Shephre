const eventModel = require('../Models/EventSchema')
const exhibitorModel = require('../Models/ExhibitorSchema')
const attendeeModel = require('../Models/AttendeeRegSchema')
const userModel = require('../Models/UserSchema')
const { recalculateUserRole } = require('../utils/roleUtils')
const { sendNotification } = require('../utils/notificationHelper')
const feedbackModel = require('../Models/FeedbackSchema')

// http://localhost:3000/event/create
const createEvent = async (req, res) => {
    try {
        let { title, date, location, description, theme, status, createdBy, schedule } = req.body
        let banner = req.file ? `/uploads/${req.file.filename}` : null

        if (!title || !date || !location || !description || !createdBy) {
            return res.json({
                message: "Field is Missing",
                status: false
            })
        }

        let newEvent = new eventModel({ title, date, location, description, theme, status, createdBy, schedule, banner })
        await newEvent.save()

        
        try {
            const users = await userModel.find({ role: { $in: ['attendee', 'exhibitor'] } });
            for (const user of users) {
                await sendNotification(req, {
                    userId: user._id,
                    title: "New Event Deployed",
                    message: `A new exhibition "${newEvent.title}" has been initialized in the grid.`,
                    type: "event"
                });
            }
        } catch (err) {
            console.error("Error dispatching event notifications:", err.message);
        }

        res.json({
            message: "Event Created",
            status: true,
            data: newEvent
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/event/getall
const getAllEvents = async (req, res) => {
    try {
        let events = await eventModel.find()

        res.json({
            message: "Events fetched",
            status: true,
            data: events
        })
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const boothModel = require('../Models/BoothSchema')

// http://localhost:3000/event/get/:id
const getEventById = async (req, res) => {
    try {
        let { id } = req.params

        let event = await eventModel.findById(id)
        if (!event) {
            return res.json({
                message: "Event not found",
                status: false
            })
        }

        // Fetch exhibitors for this event
        const exhibitors = await exhibitorModel.find({ eventId: id, status: 'approved' })
            .populate('userId', 'name email')

        // Fetch booths for this event
        const booths = await boothModel.find({ eventId: id })
            .populate({
                path: 'assignedTo',
                populate: { path: 'userId', select: 'name' }
            })

        res.json({
            message: "Event fetched successfully",
            status: true,
            data: {
                ...event._doc,
                exhibitors,
                booths
            }
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/event/update/:id
const updateEvent = async (req, res) => {
    try {
        let { id } = req.params

        let event = await eventModel.findById(id)
        if (!event) {
            return res.json({
                message: "Event not found",
                status: false
            })
        }

        const updateData = { ...req.body }
        if (req.file) {
            updateData.banner = `/uploads/${req.file.filename}`
        }

        let updatedEvent = await eventModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
        )

        // If schedule has been updated, notify all registered attendees and exhibitors
        if (req.body.schedule) {
            try {
                const registrations = await attendeeModel.find({ eventId: id, isRegistered: true });
                const exhibitors = await exhibitorModel.find({ eventId: id, status: 'approved' });

                const targetUserIds = new Set();
                registrations.forEach(r => {
                    if (r.userId) targetUserIds.add(r.userId.toString());
                });
                exhibitors.forEach(e => {
                    if (e.userId) targetUserIds.add(e.userId.toString());
                });

                for (const targetUserId of targetUserIds) {
                    await sendNotification(req, {
                        userId: targetUserId,
                        title: "Schedule Lock Updated",
                        message: `The schedule for the event "${updatedEvent.title}" has been updated.`,
                        type: "schedule"
                    });
                }
            } catch (err) {
                console.error("Error dispatching schedule update notifications:", err.message);
            }
        }

        // If event is marked completed, recalculate roles for all its exhibitors
        if (req.body.status === 'completed') {
            const exhibitors = await exhibitorModel.find({ eventId: id, status: 'approved' });
            for (const exhibitor of exhibitors) {
                await recalculateUserRole(exhibitor.userId);
            }
        }

        res.json({
            message: "Event updated successfully",
            status: true,
            data: updatedEvent
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/event/delete/:id
const deleteEvent = async (req, res) => {
    try {
        let { id } = req.params

        let event = await eventModel.findById(id)
        if (!event) {
            return res.json({
                message: "Event not found",
                status: false
            })
        }

        await eventModel.findByIdAndDelete(id)

        res.json({
            message: "Event deleted successfully",
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


// http://localhost:3000/event/stats
const getStats = async (req, res) => {
    try {
        const totalEvents = await eventModel.countDocuments()
        const totalExhibitors = await exhibitorModel.countDocuments()
        const totalAttendees = await attendeeModel.countDocuments()
        const totalUsers = await userModel.countDocuments()
        const totalBooths = await boothModel.countDocuments()
        const totalFeedback = await feedbackModel.countDocuments()

        res.json({
            message: "Stats fetched successfully",
            status: true,
            data: {
                totalEvents,
                totalExhibitors,
                totalAttendees,
                totalUsers,
                totalBooths,
                totalFeedback
            }
        })
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const { Parser } = require('json2csv');

const generateReport = async (req, res) => {
    try {
        const events = await eventModel.find().lean();
        const exhibitors = await exhibitorModel.find().populate('userId', 'name email').populate('eventId', 'title').lean();
        
        const data = exhibitors.map(ex => ({
            'Exhibitor Name': ex.userId?.name || 'N/A',
            'Exhibitor Email': ex.userId?.email || 'N/A',
            'Event': ex.eventId?.title || 'N/A',
            'Status': ex.status,
            'Company': ex.companyName,
            'Requested Booth': ex.requestedBooth || 'None'
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('event_sphere_report.csv');
        return res.send(csv);

    } catch (error) {
        res.json({
            message: "Failed to generate report",
            status: false,
            error: error.message
        });
    }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getStats, generateReport }