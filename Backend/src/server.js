const express = require('express');
const dotenv = require('dotenv');
// Load environment variables at the very top
dotenv.config();

const cors = require('cors');
const path = require('path');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Socket.io server
const connectDB = require('./config/db');

// Models (Required for socket events)
const Message = require('./models/Message');
const GroupMessage = require('./models/GroupMessage');
const MeetingMessage = require('./models/MeetingMessage');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/meetings', meetingRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins a personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // User joins a group room
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User joined group room: ${groupId}`);
  });

  // User joins a meeting room
  socket.on('join_meeting', (meetingRoomId) => {
    socket.join(`meeting_${meetingRoomId}`);
    console.log(`User joined meeting room: ${meetingRoomId}`);
  });

  // Handle private messages
  socket.on('private_message', async ({ senderId, receiverId, content }) => {
    try {
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
      });

      io.to(receiverId).emit('new_message', newMessage);
      io.to(senderId).emit('new_message', newMessage);
    } catch (error) {
      console.error('Socket Message Error:', error);
    }
  });

  // Handle group messages
  socket.on('send_group_message', async ({ groupId, senderId, content }) => {
    try {
      const newMessage = await GroupMessage.create({
        group: groupId,
        sender: senderId,
        content,
      });

      const populatedMessage = await GroupMessage.findById(newMessage._id).populate('sender', 'name profilePicture role');
      io.to(groupId).emit('new_group_message', populatedMessage);
    } catch (error) {
      console.error('Group Socket Message Error:', error);
    }
  });

  // Handle meeting messages
  socket.on('send_meeting_message', async ({ meetingId, senderId, content }) => {
    try {
      const newMessage = await MeetingMessage.create({
        meeting: meetingId,
        sender: senderId,
        content,
      });

      const populatedMessage = await MeetingMessage.findById(newMessage._id).populate('sender', 'name profilePicture department role');
      io.to(`meeting_${meetingId}`).emit('new_meeting_message', populatedMessage);
    } catch (error) {
      console.error('Meeting Socket Message Error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CampusBridge API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
