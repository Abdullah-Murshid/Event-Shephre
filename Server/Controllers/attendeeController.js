const attendeeRegModel = require('../Models/AttendeeRegSchema')
const eventModel = require('../Models/EventSchema')

// http://localhost:3000/attendee/register
const registerAttendee = async (req, res) => {
    try {
        let { userId, eventId } = req.body

        if (!userId || !eventId) {
            return res.json({
                message: "Fields are missing",
                status: false
            })
        }

        // check if already exists (as bookmark or registration)
        let attendee = await attendeeRegModel.findOne({ userId, eventId })
        if (attendee) {
            if (attendee.isRegistered) {
                return res.json({
                    message: "Already registered for this event",
                    status: false
                })
            } else {
                // If they had it bookmarked, now register them
                attendee.isRegistered = true
                await attendee.save()
                return res.json({
                    message: "Attendee registered successfully",
                    status: true,
                    data: attendee
                })
            }
        }

        let newAttendee = new attendeeRegModel({ userId, eventId, isRegistered: true })
        await newAttendee.save()

        res.json({
            message: "Attendee registered successfully",
            status: true,
            data: newAttendee
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/getall
const getAllAttendees = async (req, res) => {
    try {
        let attendees = await attendeeRegModel.find()
        .populate('userId', 'name email')
        .populate('eventId', 'title date location status')

        res.json({
            message: "Attendees fetched successfully",
            status: true,
            data: attendees
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/get/:id
const getAttendeeById = async (req, res) => {
    try {
        let { id } = req.params

        let attendee = await attendeeRegModel.findById(id)
        if (!attendee) {
            return res.json({
                message: "Attendee not found",
                status: false
            })
        }

        res.json({
            message: "Attendee fetched successfully",
            status: true,
            data: attendee
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/addsession/:id
const addSession = async (req, res) => {
    try {
        let { id } = req.params
        let { sessionIndex, title, startTime } = req.body

        let attendee = await attendeeRegModel.findById(id)
        if (!attendee) {
            return res.json({
                message: "Attendee not found",
                status: false
            })
        }

        // check if session already added
        const alreadyAdded = attendee.registeredSessions.some(s => s.sessionIndex === sessionIndex)
        if (alreadyAdded) {
            return res.json({
                message: "Session already registered",
                status: false
            })
        }

        attendee.registeredSessions.push({ sessionIndex, title, startTime })
        await attendee.save()

        res.json({
            message: "Session added successfully",
            status: true,
            data: attendee
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/addbookmark/:id
const addBookmark = async (req, res) => {
    try {
        let { id } = req.params
        let { sessionId } = req.body

        let attendee = await attendeeRegModel.findById(id)
        if (!attendee) {
            return res.json({
                message: "Attendee not found",
                status: false
            })
        }

        // check if already bookmarked
        if (attendee.bookmarks.includes(sessionId)) {
            return res.json({
                message: "Session already bookmarked",
                status: false
            })
        }

        attendee.bookmarks.push(sessionId)
        await attendee.save()

        res.json({
            message: "Bookmark added successfully",
            status: true,
            data: attendee
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/notifications/:userId - get upcoming bookmarked sessions
const getNotifications = async (req, res) => {
    try {
        let { userId } = req.params

        // Find attendee registrations for this user
        const registrations = await attendeeRegModel.find({ userId })
            .populate('eventId', 'title date schedule')

        const now = new Date()
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const notifications = []

        registrations.forEach(reg => {
            if (!reg.eventId) return

            // Check scheduled sessions
            reg.eventId.schedule?.forEach((session, index) => {
                const sessionStart = new Date(session.startTime)
                if (sessionStart >= now && sessionStart <= twentyFourHoursLater) {
                    notifications.push({
                        type: 'session_reminder',
                        title: session.title,
                        topic: session.topic,
                        eventTitle: reg.eventId.title,
                        startTime: session.startTime,
                        location: session.location,
                        speaker: session.speaker,
                        timeUntilStart: getTimeUntil(sessionStart)
                    })
                }
            })
        })

        // Sort by start time
        notifications.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

        res.json({
            message: "Notifications fetched successfully",
            status: true,
            data: notifications
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// Helper function to get time until session
function getTimeUntil(date) {
    const now = new Date()
    const diff = date - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

// http://localhost:3000/attendee/delete/:id
const deleteAttendee = async (req, res) => {
    try {
        let { id } = req.params

        let attendee = await attendeeRegModel.findById(id)
        if (!attendee) {
            return res.json({
                message: "Attendee not found",
                status: false
            })
        }

        await attendeeRegModel.findByIdAndDelete(id)

        res.json({
            message: "Attendee deleted successfully",
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

// http://localhost:3000/attendee/bookmarks/:userId - get bookmarks for user
const getBookmarks = async (req, res) => {
    try {
        let { userId } = req.params

        const attendees = await attendeeRegModel.find({ userId })
            .populate('eventId', 'title date location image theme')

        const bookmarkedEvents = attendees
            .filter(a => a.bookmarks && a.bookmarks.length > 0)
            .map(a => a.eventId)
            .filter(e => e !== null)

        res.json({
            message: "Bookmarks fetched successfully",
            status: true,
            data: bookmarkedEvents
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/bookmarks - add bookmark
const createBookmark = async (req, res) => {
    try {
        let { userId, eventId } = req.body

        if (!userId || !eventId) {
            return res.json({
                message: "User ID and Event ID are required",
                status: false
            })
        }

        // Find or create attendee registration for this event
        let attendee = await attendeeRegModel.findOne({ userId, eventId })

        if (!attendee) {
            attendee = new attendeeRegModel({ userId, eventId, bookmarks: [], isRegistered: false })
            await attendee.save()
        }

        // Check if already bookmarked this event
        if (attendee.bookmarks.includes(eventId)) {
            return res.json({
                message: "Event already bookmarked",
                status: false
            })
        }

        attendee.bookmarks.push(eventId)
        await attendee.save()

        res.json({
            message: "Bookmark added successfully",
            status: true,
            data: attendee.bookmarks
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/bookmarks/:userId/:eventId - remove bookmark
const removeBookmark = async (req, res) => {
    try {
        let { userId, eventId } = req.params

        const attendee = await attendeeRegModel.findOne({ userId, eventId })

        if (!attendee) {
            return res.json({
                message: "No registration found",
                status: false
            })
        }

        attendee.bookmarks = attendee.bookmarks.filter(b => b.toString() !== eventId)
        await attendee.save()

        res.json({
            message: "Bookmark removed successfully",
            status: true,
            data: attendee.bookmarks
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/attendee/session-bookmark - toggle session bookmark
const toggleSessionBookmark = async (req, res) => {
    try {
        let { userId, eventId, sessionTitle } = req.body

        if (!userId || !eventId || !sessionTitle) {
            return res.json({
                message: "User ID, Event ID, and Session Title are required",
                status: false
            })
        }

        let attendee = await attendeeRegModel.findOne({ userId, eventId })

        if (!attendee) {
            attendee = new attendeeRegModel({ userId, eventId, bookmarkedSessions: [] })
            await attendee.save()
        }

        const index = attendee.bookmarkedSessions.indexOf(sessionTitle)
        if (index > -1) {
            // Remove if already exists
            attendee.bookmarkedSessions.splice(index, 1)
            await attendee.save()
            return res.json({
                message: "Session bookmark removed",
                status: true,
                bookmarked: false,
                data: attendee.bookmarkedSessions
            })
        } else {
            // Add if doesn't exist
            attendee.bookmarkedSessions.push(sessionTitle)
            await attendee.save()
            return res.json({
                message: "Session bookmarked successfully",
                status: true,
                bookmarked: true,
                data: attendee.bookmarkedSessions
            })
        }

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

module.exports = { registerAttendee, getAllAttendees, getAttendeeById, addSession, addBookmark, deleteAttendee, getNotifications, getBookmarks, createBookmark, removeBookmark, toggleSessionBookmark }