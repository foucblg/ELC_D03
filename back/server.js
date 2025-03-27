// Imports
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const cookie = require("cookie");
const { strict } = require('assert');

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
    console.log(`CRUD loadPixel (début et fin) < ${JSON.stringify(table)}\n`);
    return table;
}

const history = () => {
    let table = db.prepare("SELECT x, y, color, user_id, date FROM history").all();
    console.log(`CRUD history (début et fin) < ${JSON.stringify(table)}\n`);
    return table;
}

const placePixel = (x, y, color, token) => {
    let date = new Date();
    let dateString = date.toISOString();
    let userId = getUserIdByToken(token);
    let dico = {
        "x": x,
        "y": y,
        "color": color,
        "user_id": userId,
        "date": dateString
    };
    if (userId) {
        console.log(`CRUD placePixel (début) > ${JSON.stringify(dico)}`)

        // historique
        db.prepare(`
            INSERT INTO history (x, y, color, user_id, date)
            VALUES (@x, @y, @color, @user_id, @date)
        `).run(dico);
        console.log(`CRUD placePixel > INSERT INTO history ${JSON.stringify(dico)}`);

        // grille actuelle
        let pixel = db.prepare(`
            SELECT * FROM pixel WHERE x = @x AND y = @y
        `).get(dico);
        console.log(`CRUD placePixel < pixel: ${JSON.stringify(pixel)}`);

        if (pixel) {
            db.prepare(`
                UPDATE pixel SET color = @color
                WHERE x = @x AND y = @y
            `).run(dico);
            console.log(`CRUD placePixel > UPDATE pixel (${x}, ${y}, ${color})`);
        } else {
            db.prepare(`
                INSERT INTO pixel (x, y, color)
                VALUES (@x, @y, @color)
            `).run(dico);
            console.log(`CRUD placePixel > INSERT INTO pixel (${x}, ${y}, ${color})`);
        }
        // log
        console.log(`CRUD placePixel (fin) < réussi > ${JSON.stringify(dico)}\n`);
        return true
    } else {
        return false
    }
};

const createUser = (username, password) => {
    console.log(`CRUD createUser (début) > ${username}`)
    let hashPassword = hash(password);
    let user = db.prepare(`
        SELECT * FROM user
        WHERE username = @username
    `).get({"username": username});
    if (user) {
        // username déjà pris
        console.log(`CRUD createUser (fin) < username déjà pris > ${username}`);
        return false;
    } else {
        let userId = uuid.v4().toString().slice(-12);
        db.prepare(`
            INSERT INTO user (id, username, hash_password)
            VALUES (@id, @username, @hash_password)
        `).run({
            "id": userId,
            "username": username,
            "hash_password": hashPassword
        });
        db.prepare(`
            INSERT INTO access_token (user_id)
            VALUES (@user_id)
        `).run({"user_id": userId});
        console.log(`CRUD createUser (fin) < réussi > ${username}`);
        return true;
    }
}

const getUserIdByToken = (token) => {
    let access = db.prepare(`
        SELECT user_id FROM access_token
        WHERE token = @token
    `).get({"token": token});
    if (access) {
        console.log(`CRUD getUserIdByToken (début et fin) < réussi ${access.user_id} > ${token}`)
        return access.user_id
    }
    console.log(`CRUD getUserIdByToken (début et fin) < pas de user pr ce token > ${token}`)
};

const getUsernameById = (userId) => {
    let user = db.prepare(`
        SELECT username FROM user
        WHERE id = @id
    `).get({"id": userId})
    if (user) {
        console.log(`CRUD getUsernameById (début) < ${user.username} > ${userId}`)
        return user.username;
    } else {
        console.log(`CRUD getUsernameById (début et fin) < pas de user pr cet id > ${userId}`)
        return null;
    }
};

const login = (username, password) => {
    let hashPassword = hash(password);
    user = db.prepare(`
        SELECT id FROM user
        WHERE username = @username
        AND hash_password = @hash_password
    `).get({
        "username": username,
        "hash_password": hashPassword
    })
    
    if (user) {
        let token = uuid.v4().toString().slice(-12);
        console.log(`CRUD login (début) < user ${user.id} > ${username}`)
        db.prepare(`
            UPDATE access_token SET token = @token
            WHERE user_id = @user_id
        `).run({
            "token": token,
            "user_id": user.id
        });
        console.log(`CRUD login (fin) < token ${token} > ${username}`)
        return token;
    } else {
        console.log(`CRUD login (début et fin) < pas de user > ${username}`)
        return null;
    }
};

const logout = (token) => {
    db.prepare(`
        UPDATE access_token
        SET token = NULL
        WHERE token = @token
    `).run({"token": token})
    console.log(`CRUD logout (début et fin) > ${token}`)
}

// Endpoints

app.post('/login', (request, response) => {
    let cookie = request.cookies.access_token;
    if (cookie === undefined) {
        let username = request.body.username;
        let password = request.body.password;
        let token = login(username, password);
        console.log(`Endpoint login (début et fin) < ok (pas encore de cookie) > ${username}`)
        if (token) {
            response.cookie('access_token', token, { maxAge: 2592000, httpOnly: true });
            response.redirect('back');
        } else {
            response.send("Combinaison nom d'utilisateur / mot de passe invalide");
        }
    } else {
        console.log(`Endpoint login (début) < déjà un cookie ${cookie} > ${request.body.username}`)
        let userId = getUserIdByToken(cookie);
        if (userId) {
            console.log(`Endpoint login (fin) < ko (déjà co via ce cookie valide : ${cookie}) > ${username}`);
        } else {
            let username = request.body.username;
            let password = request.body.password;
            let token = login(username, password);
            console.log(`Endpoint login (fin) < ok (y a ${cookie} ms il est à personne) > ${username}`);
            if (token) {
                response.cookie('access_token', token, { maxAge: 2592000 });
                response.redirect('back');
            } else {
                response.send("Combinaison nom d'utilisateur / mot de passe invalide");
            }
        }
    }
  });

app.get('/login-status', (request, response) => {
    let cookie = request.cookies.access_token;
    if (cookie === undefined) {
        console.log(`Endpoint login-status (début et fin) < pas co > rien`)
        response.send({
            "logged": false,
            "text": "Vous n'êtes pas connecté"
        });
    } else {
        let userId = getUserIdByToken(cookie);
        if (userId) {
            let username = getUsernameById(userId);
            console.log(`Endpoint login-status (début et fin) < ${username} > cookie ${cookie}`)
            response.send({
                "logged": true,
                "text": `Connecté en tant que ${username}`
            });
        } else {
            console.log(`Endpoint login-status (début et fin) < pas de user pr ce token > cookie ${cookie}`);
            response.send({
                "logged": false,
                "text": "Vous n'êtes pas connectés"
            });
        }
    }
})

app.post("/logout", (request, response) => {
    let cookie = request.cookies.access_token;
    if (cookie !== undefined) {
        logout(cookie);
        console.log(`Endpoint logout (début et fin) < ok (cookie existant à suppr ${cookie})`)
        response.clearCookie('access_token');
        response.redirect('back');
    } else {
        console.log(`Endpoint logout (début et fin) < ko (pas de cookie à suppr)`)
        response.send("Vous n'étiez déjà pas connecté");
    }
})  

app.get("/history", (request, response) => {
    response.send(history());
    console.log("Endpoint history < ok")
})

// Websockets

io.on('connection', (socket) => {
    console.log('WS co');

    let token = null;
    if (socket.handshake.headers.cookie) {
        token = cookie.parse(socket.handshake.headers.cookie).access_token;
        console.log(`WS token < ${token}, userId ${getUserIdByToken(token)}`)
    }

    socket.on('placePixelInDB', ({ x, y, color }) => {
        console.log(`WS placePixelInDB < reçu > ${JSON.stringify({ x, y, color })}`);
        if (token) {
            if (placePixel(x, y, color, token)) {
                io.emit('placePixelOnScreen', { x, y, color });
                console.log(`WS placePixelOnScreen < émis > ${JSON.stringify({ x, y, color, token })}`)
            }
        } else {
            console.log(`WS placePixel < refus d'émettre (pas de token) > ${JSON.stringify({ x, y, color })}`);
        }
    });
    
    socket.emit('loadPixels', loadPixels()); // TODO: ne le faire que si la page a jms été chargée

    socket.on('disconnect', () => {
        console.log("WS déco");
    });
});

// Run serveur
createUser("admin", "admin");
createUser("Marco", "zxcvbn");
createUser("Fouco", "azerty");
server.listen(port, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});