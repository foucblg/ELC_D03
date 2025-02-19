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
    path2 = 'front' + path2;
    fichier = fs.readFileSync(path2, "utf-8");
    response.write(fichier);
    response.end();
}

const serveur = http.createServer(handler);

serveur.listen(3000);