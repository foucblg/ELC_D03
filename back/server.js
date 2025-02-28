const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const db = new Database('pixels.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS pixels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color TEXT NOT NULL
    )
`);

const loadPixels = () => db.prepare("SELECT x, y, color FROM pixels").all();

const savePixel = (x, y, color) => {
    db.prepare("INSERT INTO pixels (x, y, color) VALUES (?, ?, ?)").run(x, y, color);
};

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    socket.emit('loadPixels', loadPixels());

    socket.on('placePixel', ({ x, y, color }) => {
        savePixel(x, y, color);
        io.emit('placePixel', { x, y, color });
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});