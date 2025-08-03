const express = require('express');
const { nanoid } = require('nanoid');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000"
  }
});

// Store users and messages
const users = new Map();
const messageHistory = [];

io.on('connection', (socket) => {
  const userId = nanoid(6);
  let username = `User-${Math.floor(Math.random() * 1000)}`; // Default random name
  
  // Handle username setting
  socket.on('set-username', (name) => {
    username = name || username;
    users.set(userId, { socket, username });
    updateOnlineUsers();
    socket.emit('username-set', username);
    console.log(username)
  });

  users.set(userId, { socket, username });
  
  // Send initial data to new user
  socket.emit('init', { 
    userId, 
    defaultUsername: username,
    messageHistory 
  });
  
  // Typing indicators
  socket.on('typing', () => {
    socket.broadcast.emit('user-typing', username);
  });
  
  socket.on('stop-typing', () => {
    socket.broadcast.emit('user-stopped-typing', username);
  });
  
  // Message handling
  socket.on('group-message', (message) => {
    const msg = {
      type: 'group',
      from: userId,
      fromUsername: username,
      message,
      timestamp: new Date().toISOString()
    };
    messageHistory.push(msg);
    io.emit('group-message', msg);
  });
  
  socket.on('private-message', ({ to, message }) => {
    const msg = {
      type: 'private',
      from: userId,
      fromUsername: username,
      to,
      message,
      timestamp: new Date().toISOString()
    };
    messageHistory.push(msg);
    const receiver = users.get(to)?.socket;
    if (receiver) {
      receiver.emit('private-message', msg);
    }
    socket.emit('private-message', msg); // Also send back to sender
  });
  
  // Disconnection
  socket.on('disconnect', () => {
    users.delete(userId);
    updateOnlineUsers();
  });
  
  function updateOnlineUsers() {
    const onlineUsers = Array.from(users.entries()).map(([id, { username }]) => ({
      id,
      username
    }));
    io.emit('online-users', onlineUsers);
  }
});

http.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});