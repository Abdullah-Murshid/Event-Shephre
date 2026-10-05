const express = require('express')
const ConnectedDB = require('./config/db')
const cors = require('cors')
require('dotenv').config()
const authRoutes = require('./Routes/authRoutes')
const userRoutes = require('./Routes/userRoutes')
const eventRoutes = require('./Routes/eventRoutes')
const boothRoutes = require('./Routes/boothRoutes')
const exhibitorRoutes = require('./Routes/exhibitorRoutes')
const attendeeRoutes = require('./Routes/attendeeRoutes')
const feedbackRoutes = require('./Routes/feedbackRoutes')
const messageRoutes = require('./Routes/messageRoutes')
const notificationRoutes = require('./Routes/notificationRoutes')

const app = express()
const PORT = process.env.PORT 
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)

// Socket.io setup - Move it up so we can attach it to app before routes
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

// Attach io to app so controllers can access it
app.set('socketio', io)

const path = require('path')

ConnectedDB()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
    res.send("server is live")
})

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/event', eventRoutes)
app.use('/booth', boothRoutes)
app.use('/exhibitor', exhibitorRoutes)
app.use('/attendee', attendeeRoutes)
app.use('/feedback', feedbackRoutes)
app.use('/message', messageRoutes)
app.use('/notifications', notificationRoutes)

// Store connected users
const connectedUsers = new Map()

io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // User joins their own room
    socket.on('join', (userId) => {
        socket.join(userId)
        connectedUsers.set(userId, socket.id)
        console.log('User joined room:', userId)
    })

    // Send message event
    socket.on('sendMessage', (data) => {
        const { receiverId, message } = data
        io.to(receiverId).emit('newMessage', message)
    })

    // Schedule updated event
    socket.on('scheduleUpdated', (data) => {
        io.emit('scheduleUpdated', data)
    })

    // Booth updated event
    socket.on('boothUpdated', (data) => {
        io.emit('boothUpdated', data)
    })

    // Notification event
    socket.on('sendNotification', (data) => {
        const { userId, notification } = data
        io.to(userId).emit('notification', notification)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        connectedUsers.delete(socket.id)
    })
})

server.listen(PORT, () => {
    console.log(`server is Running on PORT: ${PORT}`)
})

module.exports = { app, io, server }