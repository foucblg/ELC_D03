const http = require('http');
const url = require('url');
const fs = require('fs')
const path = require('path');
const socketio = require('socket.io');
const db = require("./db");

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

function handler(request, response) {
    var path2 = request.url;
    var method = request.method;
    console.log(method + path2);
    switch (method) {
        case "GET":
            switch (path2) {
                case "/favicon.ico":
                    response.setHeader('Content-Type', 'image/x-icon');
                    fs.createReadStream('front' + path2).pipe(response);
                case "/get_all_pixels":
                    response.setHeader('Content-Type', 'application/json');
                    response.write(JSON.stringify(
                        db.get_all_pixels()
                    ))
                    response.end();
                default:
                    if (path2 == "/") {
                        path2 = "/index.html"
                    };
                    path2 = 'front' + path2;
                    fichier = fs.readFileSync(path2, "utf-8");
                    response.write(fichier);
                    response.end();
            }
        case "POST":
            var body = "";
            request.on('data', (data) => {
                body += data
                console.log(body)
            })
            request.on('end', () => {
                console.log("Body final : ", body)
                if (path2 == "/add_pixel") {
                    db.add_pixel();
                    console.log(db.get_all_pixels());
                    response.end();
                }
            })
    }
}

function socket(s) {
    s.emit("yo", {"clef": "valeur"})
}

/*
conn.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la db");
    conn.query(sql, (err, result) => {
      if (err) throw err;
      console.log("Resultat: " + result);
      return result;
    });
  });
*/

const serveur = http.createServer(handler);
//const ws = socketio.listen(serveur);
serveur.listen(port);
//ws.on('connection', socket);
console.log(`Adresse : http://localhost:${port}/`);


// const WebSocket = require('ws');
// const http = require('http');

// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('WebSocket server is running.');
// });

// const wss = new WebSocket.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('Client connecté');

//   ws.on('message', (message) => {
//     console.log(`Message reçu : ${message}`);

//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(`Message reçu : ${message}`);
//       }
//     });
//   });

//   ws.send('Bienvenue sur le WebSocket Server !');
// });

// server.listen(8080, () => {
//   console.log('Serveur WebSocket démarré sur ws://localhost:8080');
// });