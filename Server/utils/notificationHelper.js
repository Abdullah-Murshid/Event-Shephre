const notificationModel = require('../Models/NotificationSchema');

/**
 * Dispatches a notification by saving it to MongoDB and broadcasting it via Socket.io.
 * 
 * @param {object} req - Express Request object (used to extract socketio instance).
 * @param {object} params - Notification options.
 * @param {string} params.userId - Target user ID.
 * @param {string} params.title - Notification title.
 * @param {string} params.message - Notification message.
 * @param {string} params.type - 'event' | 'schedule' | 'system'
 * @returns {Promise<object>} The saved notification model.
 */
const sendNotification = async (req, { userId, title, message, type }) => {
    try {
        const notification = new notificationModel({
            userId,
            title,
            message,
            type,
            isRead: false
        });
        await notification.save();

        const io = req.app.get('socketio');
        if (io) {
            io.to(userId.toString()).emit("newNotification", {
                id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                createdAt: notification.createdAt || new Date()
            });
        }
        return notification;
    } catch (error) {
        console.error("Failed to dispatch notification:", error.message);
        throw error;
    }
};

module.exports = { sendNotification };
