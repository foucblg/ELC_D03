const http = require('http');
const url = require('url');
const fs = require('fs')
const path = require('path');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

function handler(request, response) {
    var path2 = request.url;
    console.log('Requête : ', path2);
    if (path2 == "/") {
        path2 = "/index.html"
    };
    if (false && path2 == "/favicon.ico") {
        response.setHeader('Content-Type', 'image/x-icon');
        fs.createReadStream('front' + path2).pipe(response);
    } else { // Le navigateur fait ça tout seul
        path2 = 'front' + path2;
        fichier = fs.readFileSync(path2, "utf-8");
        response.write(fichier);
        response.end();
    }
}

const serveur = http.createServer(handler);

serveur.listen(3000);

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