const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const socket = require('socket.io');
const http = require('http');

app.use(cors());

const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});

let socketsConnected = new Set();
let users = {};

io.on('connection', (socket) => {
    console.log(`New user connected with id: ${socket.id}`);
    socketsConnected.add(socket.id);

    io.emit('userCount', socketsConnected.size);

    socket.on('message', (message) => {
        if (message.recipient === 'all') {
            io.emit('message', message);
        } else {
            socket.to(message.recipient).emit('message', message);
            socket.emit('message', message); // Also send back to sender
        }
    });

    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });

    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('updateUsersList', users);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected with id: ${socket.id}`);
        socketsConnected.delete(socket.id);
        delete users[socket.id];
        io.emit('updateUsersList', users);
        io.emit('userCount', socketsConnected.size);
    });
});

app.get('/', (req, res) => {
    res.send('Bonjour, welcome to my server');
});

server.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
