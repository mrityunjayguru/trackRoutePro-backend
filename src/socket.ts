import { Server } from 'socket.io';
import http from 'http';

export const socketUser: Array<{ userId: string, socketId: string }> = []; // Array to store userId and socketId
export let io: Server; // Declare io as a variable to export later

// Function to set up Socket.IO
export const setupSocket = (server: http.Server) => {
  io = new Server(server); // Initialize the io instance

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // Handle user registration (store userId and socketId)
    socket.on('registerUser', ({ userId, socketId }) => {
      const userExists = socketUser.some(user => user.socketId === socketId);
      if (!userExists) {
        socketUser.push({ userId, socketId });
        console.log('User registered:', socketUser);
      } 
    });

    // Example of receiving a message from the client
    socket.on('message', (data) => {
      console.log('Message received:', data);
      io.emit('message', data); // Emit to all clients
    });

    // Handle user disconnect and remove from the array
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      // Remove the user from the array
      const index = socketUser.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) {
        socketUser.splice(index, 1);
      }
    });
  });

  return io; // Return the io instance
};
