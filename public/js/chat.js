const socket = io();
const chatForm = document.getElementById('chat-form');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msgInput = document.getElementById('msg');
  socket.emit('chatMessage', { user: 'You', text: msgInput.value });
  msgInput.value = '';
});

socket.on('message', (msg) => {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML += `<div><strong>${msg.user}:</strong> ${msg.text}</div>`;
});