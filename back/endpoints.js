import { createUser, login, getUserIdByToken, logout, history, color } from './cruds.js';

export function setupEndpoints(app) {
    app.post('/register', (request, response) => {
        let cookie = request.cookies.access_token;
        if (cookie === undefined) {
            let username = request.body.username;
            let password = request.body.password;
            let created = createUser(username, password);
            console.log(`Endpoint register (début et fin) < ok (pas encore de cookie) > ${username}`);
            if (created) {
                response.redirect(`/?login-message=Compte ${username} créé avec succès !`);
            } else {
                response.redirect(`/?login-message=Le nom d'utilisateur ${username} est déjà pris !`);
            }
        } else {
            console.log(`Endpoint register (début) < déjà un cookie ${cookie} > ${request.body.username}`);
            let userId = getUserIdByToken(cookie);
            if (userId) {
                console.log(`Endpoint register (fin) < ko (déjà co via ce cookie valide : ${cookie}) > ${username}`);
            } else {
                let username = request.body.username;
                let password = request.body.password;
                let created = createUser(username, password);
                console.log(`Endpoint register (fin) < ok (y a ${cookie} ms il est à personne) > ${username}`);
                if (created) {
                    response.redirect(`/?login-message=Compte ${username} créé avec succès !`);
                } else {
                    response.redirect(`/?login-message=Le nom d'utilisateur ${username} est déjà pris !`);
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
            console.log(`Endpoint login (début et fin) < ok (pas encore de cookie) > ${username}`);
            if (token) {
                response.cookie('access_token', token, { maxAge: 2592000, httpOnly: true });
                response.redirect(`/?login-message=Connecté en tant que ${username}`);
            } else {
                response.redirect("/?login-message=Combinaison nom d'utilisateur / mot de passe invalide");
            }
        } else {
            console.log(`Endpoint login (début) < déjà un cookie ${cookie} > ${request.body.username}`);
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
                    response.redirect(`/?login-message=Connecté en tant que ${username}`);
                } else {
                    response.redirect("/?login-message=Combinaison nom d'utilisateur / mot de passe invalide");
                }
            }
        }
    });

    app.get('/login-status', (request, response) => {
        let cookie = request.cookies.access_token;
        if (cookie === undefined) {
            console.log(`Endpoint login-status (début et fin) < pas co > rien`);
            response.send(false);
        } else {
            let userId = getUserIdByToken(cookie);
            if (userId) {
                console.log(`Endpoint login-status (début et fin) < ${userId} > cookie ${cookie}`);
                response.send(true);
            } else {
                console.log(`Endpoint login-status (début et fin) < pas de user pr ce token > cookie ${cookie}`);
                response.send(false);
            }
        }
    });

    app.post("/logout", (request, response) => {
        let cookie = request.cookies.access_token;
        if (cookie !== undefined) {
            logout(cookie);
            console.log(`Endpoint logout (début et fin) < ok (cookie existant à suppr ${cookie})`);
            response.clearCookie('access_token');
            response.redirect("/?login-message=Déconnecté !");
        } else {
            console.log(`Endpoint logout (début et fin) < ko (pas de cookie à suppr)`);
            response.redirect("/?login-message=Vous n'étiez déjà pas connecté");
        }
    });

    app.get("/history", (request, response) => {
        response.send(history());
        console.log("Endpoint history < ok");
    });

    app.get("/color/:x/:y", (request, response) => {
        response.send(color(request.params.x, request.params.y));
        console.log("Endpoint color < ok");
    });
}