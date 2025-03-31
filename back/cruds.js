import { hash } from "./utils.js";
import { db } from "./server.js";
import { v4 as uuidv4 } from "uuid";

export const loadPixels = () => {
    let table = db.prepare("SELECT x, y, color FROM pixel").all();
    console.log(`CRUD loadPixels (début et fin) < ${JSON.stringify(table)}\n`);
    return table;
}

export const history = () => {
    let table = db.prepare("SELECT x, y, color, user_id, date FROM history").all();
    console.log(`CRUD history (début et fin) < ${JSON.stringify(table)}\n`);
    return table;
}

export const color = (x, y) => {
    let pixel = db.prepare(`
        SELECT color FROM pixel
        WHERE x = @x AND y = @y
    `).get({
        "x": x,
        "y": y
    });
    if (!pixel) {
        pixel = {"color": "white"};
    }
    console.log(`CRUD color (début et fin) < ${JSON.stringify(pixel)} > ${x}, ${y}\n`);
    return pixel;
}

export const loadMessages = () => {
    let table = db.prepare("SELECT text, user_id, username, date FROM message").all();
    console.log(`CRUD loadMessages (début et fin) < ${JSON.stringify(table)}\n`);
    return table;
}

export const placePixel = (x, y, color, token) => {
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

export const placeMessage = (text, token) => {
    let date = new Date();
    let dateString = date.toISOString();
    let userId = getUserIdByToken(token);
    if (userId) {
        let username = getUsernameById(userId);
        let dico = {
            "text": text,
            "user_id": userId,
            "username": username,
            "date": dateString
        };
        db.prepare(`
            INSERT INTO message (text, user_id, username, date)
            VALUES (@text, @user_id, @username, @date)
        `).run(dico);
        let dico2 = {
            "success": true,
            ...dico
        };
        console.log(`CRUD placeMessage (début et fin) < réussi > ${JSON.stringify(dico2)}`);
        return dico2;
    }
    return {"success": false}
};

export const createUser = (username, password) => {
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

export const getUserIdByToken = (token) => {
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

export const getUsernameById = (userId) => {
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

export const login = (username, password) => {
    let hashPassword = hash(password);
    let user = db.prepare(`
        SELECT id FROM user
        WHERE username = @username
        AND hash_password = @hash_password
    `).get({
        "username": username,
        "hash_password": hashPassword
    })
    
    if (user) {
        let token = uuidv4.toString().slice(-12);
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

export const logout = (token) => {
    db.prepare(`
        UPDATE access_token
        SET token = NULL
        WHERE token = @token
    `).run({"token": token})
    console.log(`CRUD logout (début et fin) > ${token}`)
}