// Imports
import http from "http"; 
import Database from 'better-sqlite3';
import express from 'express';
import { setupSocket } from './socket.js';
import cookieParser from 'cookie-parser';
import { createUser } from './cruds.js';
import { setupEndpoints } from './endpoints.js';

// Variables globales
export const app = express();
const server = http.createServer(app);

// Définition des chemins du front-end & back-end
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static('front/'));

//Start socket
setupSocket(server);

//Start endpoints
setupEndpoints(app);


export const db = new Database('back/db/pixels.db');

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
db.exec(`
    CREATE TABLE IF NOT EXISTS message (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        user_id STRING NOT NULL REFERENCES user,
        username STRING NOT NULL,
        date STRING NOT NULL
    )
`)

// Run serveur
server.listen(port, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});