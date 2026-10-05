const messageModel = require('../Models/MessageSchema');

// http://localhost:3000/message/send
const sendMessage = async (req, res) => {
    try {
        let { senderId, receiverId, expoId, content } = req.body

        if (!senderId || !receiverId || !expoId || !content) {
            return res.json({
                message: "All fields are required",
                status: false
            })
        }

        let newMessage = new messageModel({ senderId, receiverId, expoId, content })
        await newMessage.save()

        
        const io = req.app.get('socketio')
        if (io) {
            io.to(receiverId).emit('newMessage', newMessage)
            io.to(senderId).emit('newMessage', newMessage) 
        }

        res.json({
            message: "Message sent successfully",
            status: true,
            data: newMessage
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/message/getall/:userId - get all conversations for a user
const getConversations = async (req, res) => {
    try {
        let { userId } = req.params

        // Get all messages where user is sender or receiver
        let messages = await messageModel.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        })
        .populate('senderId', 'name email role')
        .populate('receiverId', 'name email role')
        .populate('expoId', 'title date')
        .sort({ createdAt: -1 })

        // Group messages by conversation partner
        const conversationsMap = {}

        messages.forEach(msg => {
            const partnerId = msg.senderId._id.toString() === userId
                ? msg.receiverId._id.toString()
                : msg.senderId._id.toString()

            if (!conversationsMap[partnerId]) {
                conversationsMap[partnerId] = {
                    partnerId,
                    partnerName: msg.senderId._id.toString() === userId
                        ? msg.receiverId.name
                        : msg.senderId.name,
                    partnerRole: msg.senderId._id.toString() === userId
                        ? msg.receiverId.role
                        : msg.senderId.role,
                    eventId: msg.expoId._id,
                    eventTitle: msg.expoId.title,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unreadCount: 0,
                    messages: []
                }
            }

            // Count unread messages
            if (msg.receiverId._id.toString() === userId && !msg.isRead) {
                conversationsMap[partnerId].unreadCount++
            }

            conversationsMap[partnerId].messages.push(msg)
        })

        // Sort conversations by last message time
        const conversations = Object.values(conversationsMap)
            .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))

        res.json({
            message: "Conversations fetched successfully",
            status: true,
            data: conversations
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/message/thread/:userId/:partnerId
const getMessageThread = async (req, res) => {
    try {
        let { userId, partnerId } = req.params

        let messages = await messageModel.find({
            $or: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
            ]
        })
        .populate('senderId', 'name email role')
        .populate('receiverId', 'name email role')
        .populate('expoId', 'title date')
        .sort({ createdAt: 1 })

        // Mark messages as read
        await messageModel.updateMany(
            { senderId: partnerId, receiverId: userId, isRead: false },
            { isRead: true }
        )

        res.json({
            message: "Messages fetched successfully",
            status: true,
            data: messages
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/message/unread/:userId 
const getUnreadCount = async (req, res) => {
    try {
        let { userId } = req.params

        const count = await messageModel.countDocuments({
            receiverId: userId,
            isRead: false
        })

        res.json({
            message: "Unread count fetched",
            status: true,
            data: { count }
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

// http://localhost:3000/message/markread/:userId 
const markAllAsRead = async (req, res) => {
    try {
        let { userId } = req.params

        await messageModel.updateMany(
            { receiverId: userId, isRead: false },
            { isRead: true }
        )

        res.json({
            message: "All messages marked as read",
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

module.exports = { sendMessage, getConversations, getMessageThread, getUnreadCount, markAllAsRead }