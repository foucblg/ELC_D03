// Imports
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');
const auth = require('basic-auth');

// Variables globales
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Définition des chemins du front-end & back-end
app.use(express.static('front/'));
const db = new Database('back/pixels.db');

// .env
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Init db
db.exec(`
    CREATE TABLE IF NOT EXISTS pixels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color STRING NOT NULL
    )
`); // pixels[x, y, color]
db.exec(`
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color STRING NOT NULL,
        date STRING NOT NULL
    )
`); // history

// CRUDs
const loadPixels = () => {
    let table = db.prepare("SELECT x, y, color FROM pixels").all();
    console.log(`SELECT pixels: ${table}\n`);
    return table;
}

const savePixel = (x, y, color) => {
    let date = new Date();
    let date_string = date.toISOString();
    let dico = {
        "x": x,
        "y": y,
        "color": color,
        "date": date_string
    };

    // historique
    db.prepare(`
        INSERT INTO history (x, y, color, date)
        VALUES (@x, @y, @color, @date)
    `).run(dico);
    console.log(`INSERT INTO history (${x}, ${y}, ${color}, ${date})`);

    // grille actuelle
    let pixel = db.prepare(`
        SELECT * FROM pixels WHERE x = @x AND y = @y
    `).all(dico);
    console.log(`pixel: ${JSON.stringify(pixel)}`);

    if (pixel[0]) {
        db.prepare(`
            UPDATE pixels SET color = @color
            WHERE x = @x AND y = @y
        `).run(dico);
        console.log(`UPDATE pixels (${x}, ${y}, ${color})`);
    } else {
        db.prepare(`
            INSERT INTO pixels (x, y, color)
            VALUES (@x, @y, @color)
        `).run({
            "x": x,
            "y": y,
            "color": color
        });
        console.log(`INSERT INTO pixels (${x}, ${y}, ${color})`);
    }

    // log
    console.log(`savePixel(${x}, ${y}, ${color})\n`);
};


// Websockets
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    socket.emit('loadPixels', loadPixels());

    socket.on('placePixel', ({ x, y, color }) => {
        savePixel(x, y, color);
        io.emit('placePixel', { x, y, color });
    });

    socket.on('disconnect', () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

// Run serveur
server.listen(port, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});