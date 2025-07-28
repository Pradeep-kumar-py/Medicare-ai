// Real-time Teleconsultation Server
// This is a Node.js server that handles WebSocket connections for video calling
// To run: node teleconsultation-server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8081", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Helper functions
const getRoomInfo = (roomId) => {
  return rooms.get(roomId) || { users: [], messages: [] };
};

const addUserToRoom = (roomId, userId, userInfo) => {
  const room = getRoomInfo(roomId);
  const existingUserIndex = room.users.findIndex(u => u.id === userId);
  
  if (existingUserIndex >= 0) {
    room.users[existingUserIndex] = { id: userId, ...userInfo };
  } else {
    room.users.push({ id: userId, ...userInfo });
  }
  
  rooms.set(roomId, room);
  return room;
};

const removeUserFromRoom = (roomId, userId) => {
  const room = getRoomInfo(roomId);
  room.users = room.users.filter(u => u.id !== userId);
  
  if (room.users.length === 0) {
    rooms.delete(roomId);
  } else {
    rooms.set(roomId, room);
  }
  
  return room;
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join consultation room
  socket.on('join-room', (data) => {
    const { roomId, doctorId, userType, userName } = data;
    
    // Store user info
    users.set(socket.id, {
      roomId,
      userType,
      userName: userName || (userType === 'doctor' ? `Dr. ${doctorId}` : 'Patient'),
      doctorId
    });

    // Join socket room
    socket.join(roomId);
    
    // Add to room tracking
    const room = addUserToRoom(roomId, socket.id, {
      userType,
      userName: userName || (userType === 'doctor' ? `Dr. ${doctorId}` : 'Patient'),
      socketId: socket.id
    });

    // Notify room about new user
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userType,
      userName: users.get(socket.id).userName,
      roomUsers: room.users
    });

    // Send current room state to new user
    socket.emit('room-state', {
      roomId,
      users: room.users,
      messages: room.messages
    });

    console.log(`User ${socket.id} joined room ${roomId} as ${userType}`);
  });

  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    const { signal, roomId, targetUser } = data;
    const user = users.get(socket.id);
    
    if (targetUser) {
      // Send to specific user
      socket.to(targetUser).emit('signal', {
        signal,
        fromUser: socket.id,
        fromUserType: user?.userType
      });
    } else {
      // Broadcast to room (except sender)
      socket.to(roomId).emit('signal', {
        signal,
        fromUser: socket.id,
        fromUserType: user?.userType
      });
    }
  });

  // Handle chat messages
  socket.on('message', (data) => {
    const { roomId, message } = data;
    const user = users.get(socket.id);
    
    const messageData = {
      ...message,
      fromUser: socket.id,
      fromUserName: user?.userName || 'Unknown',
      fromUserType: user?.userType || 'user',
      timestamp: new Date().toISOString()
    };

    // Store message in room
    const room = getRoomInfo(roomId);
    room.messages.push(messageData);
    rooms.set(roomId, room);

    // Broadcast message to room
    io.to(roomId).emit('message', messageData);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    
    socket.to(roomId).emit('typing', {
      userId: socket.id,
      userName: user?.userName,
      userType: user?.userType
    });
  });

  socket.on('stop-typing', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('stop-typing', {
      userId: socket.id
    });
  });

  // Handle call quality updates
  socket.on('call-quality', (data) => {
    const { roomId, quality, stats } = data;
    socket.to(roomId).emit('call-quality-update', {
      fromUser: socket.id,
      quality,
      stats
    });
  });

  // Handle screen sharing
  socket.on('screen-share-start', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    
    socket.to(roomId).emit('screen-share-started', {
      fromUser: socket.id,
      fromUserName: user?.userName
    });
  });

  socket.on('screen-share-stop', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('screen-share-stopped', {
      fromUser: socket.id
    });
  });

  // Handle call end
  socket.on('end-call', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    
    socket.to(roomId).emit('call-ended', {
      endedBy: socket.id,
      endedByName: user?.userName,
      endedByType: user?.userType
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user && user.roomId) {
      const room = removeUserFromRoom(user.roomId, socket.id);
      
      socket.to(user.roomId).emit('user-left', {
        userId: socket.id,
        userName: user.userName,
        userType: user.userType,
        remainingUsers: room.users
      });
    }
    
    users.delete(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });

  // Leave room explicitly
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    
    if (user && roomId) {
      socket.leave(roomId);
      const room = removeUserFromRoom(roomId, socket.id);
      
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        userName: user.userName,
        userType: user.userType,
        remainingUsers: room.users
      });
    }
  });
});

// REST API endpoints for integration
app.get('/api/rooms', (req, res) => {
  const roomsData = Array.from(rooms.entries()).map(([id, data]) => ({
    id,
    userCount: data.users.length,
    messageCount: data.messages.length,
    users: data.users.map(u => ({ userType: u.userType, userName: u.userName }))
  }));
  
  res.json(roomsData);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: roomId,
    users: room.users.map(u => ({ userType: u.userType, userName: u.userName })),
    messageCount: room.messages.length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activeUsers: users.size
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🏥 Teleconsultation Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Active rooms: http://localhost:${PORT}/api/rooms`);
});

module.exports = { app, server, io };
