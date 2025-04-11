// sockets/chat.js

module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('New user connected');
  
      // Listen for chat messages
      socket.on('chatMessage', (msg) => {
        io.emit('message', {
          user: msg.user,
          text: msg.text,
          time: new Date().toLocaleTimeString()
        });
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };