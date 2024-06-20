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

    // Je transmet au front le nombre de sockets connecter au serveur
    io.emit('userCount', socketsConnected.size);

    // Je transmet le sendMessage au front
    socket.on('sendMessage', (message) => {  // On récupère le message
        io.emit('message', message); 
    });

    // Je retransmet à tout le monde, lorsqu'on user individual setUsername
    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('updateUsersList', users);
    });

    // Nous allons gerer la déconnexion des users :
    socket.on('disconnect', () => {
        console.log(`User disconnected with id: ${socket.id}`);
        socketsConnected.delete(socket.id);
        delete users[socket.id];
        io.emit('updateUsersList', users);
        io.emit('userCount', socketsConnected.size);
    });
});


// Je met le serveur en ecoutant sur le port 3000
app.get('/', (req, res) => {
    res.send('Bonjour, welcome to my server');
});

// Je met le serveur en ecoutant sur le port 3000
server.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
