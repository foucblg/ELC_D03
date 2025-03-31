import { createUser, login, getUserIdByToken, getUsernameById, logout, history, color } from './cruds.js';

export function setupEndpoints(app){
    app.post('/register', (request, response) => {
        let cookie = request.cookies.access_token;
        if (cookie === undefined) {
            let username = request.body.username;
            let password = request.body.password;
            let created = createUser(username, password);
            console.log(`Endpoint register (début et fin) < ok (pas encore de cookie) > ${username}`);
            if (created) {
                response.send(`Compte ${username} créé avec succès !`);
            } else {
                response.send(`Le nom d'utilisateur ${username} est déjà pris !`)
            }
        } else {
            console.log(`Endpoint register (début) < déjà un cookie ${cookie} > ${request.body.username}`)
            let userId = getUserIdByToken(cookie);
            if (userId) {
                console.log(`Endpoint register (fin) < ko (déjà co via ce cookie valide : ${cookie}) > ${username}`);
            } else {
                let username = request.body.username;
                let password = request.body.password;
                let created = createUser(username, password);
                console.log(`Endpoint register (fin) < ok (y a ${cookie} ms il est à personne) > ${username}`);
                if (created) {
                    response.send(`Compte ${username} créé avec succès !`);
                } else {
                    response.send(`Le nom d'utilisateur ${username} est déjà pris !`)
                }
            }
        }
    });

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

    app.get("/color/:x/:y", (request, response) => {
        response.send(color(request.params.x, request.params.y));
        console.log("Endpoint color < ok")
    })
}