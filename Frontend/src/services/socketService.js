import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

let socket = null
let currentUserId = null

const createSocket = (userId) => {
    if (socket) {
        socket.disconnect()
        socket.removeAllListeners()
        socket = null
    }

    socket = io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        query: { userId } 
    })

    socket.on('connect', () => {
        console.log('[socket] connected:', socket.id)
        socket.emit('join', userId)
    })

    socket.on('connect_error', (err) => {
        console.error('[socket] connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
        console.log('[socket] disconnected:', reason)
    })

    return socket
}

export const connectSocket = (userId) => {
    if (!userId) 
        return

    if (socket?.connected && currentUserId === userId) 
        return

    currentUserId = userId
    const s = createSocket(userId)
    s.connect()
}

export const disconnectSocket = () => {
    currentUserId = null
    if (socket) {
        socket.disconnect()
        socket.removeAllListeners()
        socket = null
    }
}

// Export a getter so Inbox always gets the live instance
export const getSocket = () => socket

export default { connectSocket, disconnectSocket, socket }