const fs = require("fs");
chemin_db = "back/db.json"

crud = (fn) => {
    fs.readFile(chemin_db, (err, db) => {
        if (err) throw err;
        return fn(JSON.parse(db))
    })
}

test = () => {
    fs.readFile(chemin_db, (err, db) => {
        if (err) throw err;
        var db2 = JSON.parse(db);
        console.log("Dans test : " + JSON.stringify(db2));
        console.log(db2["pixels"]);
        return () => {return db2};
    })
}

get_db = () => {
    crud((x) => {return x})
}
write_db = (table, clef, valeur) => crud((db) => {
    db[table][clef] = valeur;
    fs.writeFile(chemin_db, JSON.stringify(db))
})

add_pixel = (x, y, couleur) => write_db("pixels", [x, y], couleur)
get_all_pixels = () => {
    return get_db()
}

module.exports = {
    add_pixel,
    get_all_pixels,
    test
}
