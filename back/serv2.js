const express = require('express');
const app = express();
const db = require("./db");

const fs = require("fs");
chemin_db = "back/db.json"
test2 = () => {
    var db2;
    fs.readFile(chemin_db, function(err, db) {
        if (err) throw err;
        db2 = JSON.parse(db);
        console.log("Dans test2 : " + JSON.stringify(db2));
        console.log(db2["pixels"]);
    })
    return db2;
}

app.use(express.json());
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

app.get("/all_pixels", (request, response) => {
    all_pixels = test2();
    console.log("J'ai ça dans /all_pixels : " + JSON.stringify(all_pixels));
    response.send(all_pixels);
})

app.get(
    '/*',
    express.static("front")
);

app.listen(port, () => {
    console.log(`http://${host}:${port}`)
});