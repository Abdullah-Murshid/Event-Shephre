const notificationModel = require('../Models/NotificationSchema');
const { sendNotification } = require('../utils/notificationHelper');

// http://localhost:3000/notifications/:userId
const getUnreadNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const unreadNotifications = await notificationModel.find({ 
            userId, 
            isRead: false 
        }).sort({ createdAt: -1 });

        res.json({
            message: "Unread notifications fetched successfully",
            status: true,
            data: unreadNotifications
        });
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        });
    }
};

// http://localhost:3000/notifications/read/:id
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await notificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { returnDocument: 'after' }
        );

        if (!notification) {
            return res.json({
                message: "Notification not found",
                status: false
            });
        }

        res.json({
            message: "Notification marked as read successfully",
            status: true,
            data: notification
        });
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        });
    }
};

// http://localhost:3000/notifications/alert
const sendCustomAlert = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.json({
                message: "Fields are missing",
                status: false
            });
        }

        const notification = await sendNotification(req, {
            userId,
            title,
            message,
            type: 'system'
        });

        res.json({
            message: "System alert dispatched successfully",
            status: true,
            data: notification
        });
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        });
    }
};

module.exports = { getUnreadNotifications, markAsRead, sendCustomAlert };
