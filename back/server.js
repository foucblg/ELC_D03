// Imports
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const cookie = require("cookie");

// Variables globales
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Définition des chemins du front-end & back-end
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static('front/'));
const db = new Database('back/pixels.db');

// .env
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Init db
db.exec(`
    CREATE TABLE IF NOT EXISTS pixel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color STRING NOT NULL
    )
`);
db.exec(`
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        color STRING NOT NULL,
        user_id STRING NOT NULL REFERENCES user,
        date STRING NOT NULL
    )
`);
db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id STRING PRIMARY KEY,
        username STRING NOT NULL,
        hash_password INTEGER NOT NULL
    )
`)
db.exec(`
    CREATE TABLE IF NOT EXISTS access_token (
        token STRING PRIMARY KEY,    
        user_id STRING NOT NULL REFERENCES user
    )
`)

// Utils

// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

// CRUDs
const loadPixels = () => {
    let table = db.prepare("SELECT x, y, color FROM pixel").all();
    console.log(`SELECT pixel: ${JSON.stringify(table)}\n`);
    return table;
}

const placePixel = (x, y, color, token) => {
    let date = new Date();
    let date_string = date.toISOString();
    user_id = get_user_id_by_token(token);
    if (user_id) {
        let dico = {
            "x": x,
            "y": y,
            "color": color,
            "user_id": user_id,
            "date": date_string
        };

        // historique
        db.prepare(`
            INSERT INTO history (x, y, color, user_id, date)
            VALUES (@x, @y, @color, @user_id, @date)
        `).run(dico);
        console.log(`INSERT INTO history ${JSON.stringify(dico)}`);

        // grille actuelle
        let pixel = db.prepare(`
            SELECT * FROM pixel WHERE x = @x AND y = @y
        `).get(dico);
        console.log(`pixel: ${JSON.stringify(pixel)}`);

        if (pixel) {
            db.prepare(`
                UPDATE pixel SET color = @color
                WHERE x = @x AND y = @y
            `).run(dico);
            console.log(`UPDATE pixel (${x}, ${y}, ${color})`);
        } else {
            db.prepare(`
                INSERT INTO pixel (x, y, color)
                VALUES (@x, @y, @color)
            `).run(dico);
            console.log(`INSERT INTO pixel (${x}, ${y}, ${color})`);
        }
        // log
    console.log(`placePixel(${JSON.stringify(dico)})\n`);
    } else {
        console.log("placePixel : pas de user pr ce token")
    }
};

const create_user = (username, password) => {
    let hash_password = hash(password);
    let user = db.prepare(`
        SELECT * FROM user
        WHERE username = @username
    `).get({"username": username});
    if (user) {
        // username déjà pris
    } else {
        user_id = uuid.v4().toString().slice(-12);
        db.prepare(`
            INSERT INTO user (id, username, hash_password)
            VALUES (@id, @username, @hash_password)
        `).run({
            "id": user_id,
            "username": username,
            "hash_password": hash_password
        });
        db.prepare(`
            INSERT INTO access_token (user_id)
            VALUES (@user_id)
        `).run({"user_id": user_id});
    }
}

const get_user_id_by_token = (token) => {
    access = db.prepare(`
        SELECT user_id FROM access_token
        WHERE token = @token
    `).get({"token": token});
    if (access) {
        return access.user_id
    }
};

const login = (username, password) => {
    let hash_password = hash(password);
    user = db.prepare(`
        SELECT id FROM user
        WHERE username = @username
        AND hash_password = @hash_password
    `).get({
        "username": username,
        "hash_password": hash_password
    })
    if (user) {
        token = uuid.v4().toString().slice(-12);
        console.log(token);
        console.log(user);
        db.prepare(`
            UPDATE access_token SET token = @token
            WHERE user_id = @user_id
        `).run({
            "token": token,
            "user_id": user.id
        });
        return token;
    } else {
        return null;
    }
};

const logout = (token) => {
    db.prepare(`
        DELETE FROM access_token
        WHERE token = @token
    `).run({"token": token})
}


// Endpoints
app.post('/login', (request, response) => {
    let cookie = request.cookies.access_token;
    if (cookie === undefined) {
        console.log("on va mettre un cookie")
        let username = request.body.username;
        let password = request.body.password;
        console.log(username)
        let token = login(username, password);
        if (token) {
            response.cookie('access_token', token, { maxAge: 2592000, httpOnly: true })
            response.send('Cookie set successfully');
        } else {
            response.send('No cookie to set');
        }
    }
  });

app.post("/logout", (request, response) => {
    let token = request.cookies.access_token;
    if (cookie !== undefined) {
        logout(token);
        response.clearCookie('access_token');
        response.send('Cookie deleted successfully');
    }
    response.send('No cookie to delete');
})

// Websockets
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');
    if (socket.handshake.headers.cookie) {
        let token = cookie.parse(socket.handshake.headers.cookie).access_token;
        console.log(token);
        console.log("Son user_id :")
        console.log(get_user_id_by_token(token))
        socket.on('placePixel', ({ x, y, color }) => {
            console.log()
            placePixel(x, y, color, token);
            io.emit('placePixel', { x, y, color });
        });
    }
    
    socket.emit('loadPixels', loadPixels()); // TODO : ne le faire que si la page a jms été chargée

    socket.on('disconnect', () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

// Run serveur
create_user("admin", "admin");
create_user("Marco", "zxcvbn");
create_user("Fouco", "azerty");

server.listen(port, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});