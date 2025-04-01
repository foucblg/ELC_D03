const socket = io(); // Connection au serveur
var size_px = 20; // Taille d'un pixel
var dim = 20; // Dimension de la grille
var id_clicked = -1; // Id du pixel cliqué
var previous_id_clicked = -1; // Id du pixel précédent
var container = document.getElementById("gridContainer"); // Conteneur de la grille
container.style.gridTemplateColumns = `repeat(${dim}, ${size_px+4}px)`; // Création de la grille
var color_picked = "green"; // Couleur du pixel
var last_color = "white"; // Couleur du pixel précédent
var drawed = false; // Booléen pour savoir si le pixel a été dessiné
var x; // Coordonnée x du pixel
var y; // Coordonnée y du pixel
var mode = "direct"; // Mode en cours (direct ou history)
var isLoggedIn; // Booléen pour savoir si l'utilisateur est connecté
const params = new URLSearchParams(window.location.search); // Récupération des paramètres de l'url
const loginMessage = params.get("login-message");  // Message de connexion
if (loginMessage) {
    document.getElementById('status').textContent = loginMessage;
}
// Création de la grille
for (let i = 0; i < dim; i++) { 
    for (let j = 0; j < dim; j++) {
        let canvas = document.createElement("canvas");
        canvas.width = size_px;
        canvas.height = size_px;
        canvas.setAttribute("data-x", i);
        canvas.setAttribute("data-y", j);
        container.appendChild(canvas);

        canvas.addEventListener("click", (function(i, j) {
            return async function() {
                await selectCanvas(i, j);
            };
        })(i, j));
    }
}

var colorBoxes = document.querySelectorAll(".color-box");
colorBoxes.forEach(function(box) {
    box.addEventListener("click", function() {
        if (id_clicked == -1) return;
        color_picked = box.getAttribute("data-color");
        sendPixel(x, y, color_picked);
    });
});

async function selectCanvas(i, j) {
    if (isLoggedIn && mode == "direct") {
        if (!drawed && previous_id_clicked != -1) {
            container.children[previous_id_clicked].style.border = `2px solid ${last_color}`;
        }
        last_color = await get_pixel_color(i, j);
        x = i;
        y = j;
        id_clicked = i*dim + j;
        container.children[id_clicked].style.border = "2px solid red"; // Bordure rouge pour le pixel cliqué
        previous_id_clicked = id_clicked;
        drawed = false;
    }
}

// https://dev.to/inezabonte/how-to-make-a-mini-messenger-with-javascript-for-beginners-mm3
const messageForm = document.getElementById('messageForm'); // Form pour envoyer des messages
messageForm.addEventListener('submit', event => {
    event.preventDefault();

    //input to save the message itself
    const input = document.getElementById('textBox');

    //This helps us to detect empty messages and ignore them
    const text = input.value.trim();

    if(text !== ''){
        sendMessage(text);
        input.value = '';
        input.focus();
    }
});

function sendPixel(x, y, color) {
    socket.emit("placePixelInDB", { x, y, color }); // Envoi des coordonnées et de la couleur du pixel en WS
}

function sendMessage(text) {
    socket.emit("placeMessageInDB", { text }); // Envoi du message en WS
}

function drawPixel(x, y, color) { // Dessine un pixel de couleur color aux coordonnées x, y
    let canvas = container.children[x * dim + y];
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size_px, size_px);
}

function showMessage(msg) { // Affiche un message dans la chatbox
    console.log(JSON.stringify(msg));
    const chatbox = document.getElementById('chatbox');
    date = new Date(msg.date);
    dateString = date.toLocaleTimeString(navigator.language, {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour: '2-digit', minute:'2-digit'});
    text = dateString + " <b>" + msg.username + "</b> " + msg.text;
    chatbox.innerHTML += text + "<br>";
    chatbox.scrollTop = chatbox.scrollHeight;
}

function sleep(ms) { // Fonction pour attendre ms millisecondes
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawInCanvas(id) { // Dessine un pixel de couleur color_picked dans le canvas
    let canvas = container.children[id];
    let ctx = canvas.getContext("2d");
    id_clicked = -1;
    drawed = true;

    canvas.style.transition = "all 100ms linear";
    canvas.style.background = color_picked;
    canvas.style.border = `2px solid ${color_picked}`;
    canvas.style.transition = "";
    ctx.fillStyle = color_picked;
    ctx.fillRect(0, 0, size_px+5, size_px+5);
}

socket.on("loadPixels", async (pixels) => { // Charge les pixels de la base de données en WS
    for (let pixel of pixels) {
        let {x, y, color} = pixel;
        color_picked = color;
        drawInCanvas(x * dim + y);
    }
});

socket.on("placePixelOnScreen", ({ x, y, color }) => { // Place un pixel sur l'écran en WS
    if (mode == "direct") {
        color_picked = color;
        drawInCanvas(x * dim + y);
    }
});

socket.on("loadMessages", async (messages) => { // Charge les messages de la base de données en WS
    for (let msg of messages) {
        showMessage(msg);
    }
});

socket.on("placeMessageOnScreen", (msg) => { // Place un message sur l'écran en WS
    showMessage(msg);
});

async function checkLoginStatus() { // Vérifie si l'utilisateur est connecté
    const res = await fetch("/login-status");
    isLoggedIn = await res.json();
    if (isLoggedIn) {
        document.getElementById('signForm').style.display = 'none';
    } else {
        document.getElementById('messageForm').style.display = 'none';
        document.getElementById('logoutForm').style.display = 'none';
        document.getElementById('colorPicker').style.display = 'none';
    }
}

async function get_pixel_color(x, y) { // Récupère la couleur du pixel aux coordonnées x, y
    const res = await fetch(`/color/${x}/${y}`);
    result = await res.json();
    return result.color;
}

async function history() { // Affiche l'historique des pixels
    const res = await fetch("/history");
    const pixels = await res.json();
    clear_grid();
    
    document.getElementById('mode').textContent = "Retour au direct";
    for (let pixel of pixels) {
        if (mode == "direct") {
            break;
        }
        let {x, y, color} = pixel;
        color_picked = color;
        drawInCanvas(x*dim + y);
        await sleep(50);
    }
    mode = "direct"
    document.getElementById('mode').textContent = "Voir l'histoire";
    clear_grid();
    socket.emit("askPixels"); // Demande les pixels en WS pour revenir au direct
}


function switch_mode(){ // Change le mode d'affichage'
    if (mode == "direct"){
        mode = "history";
        history();
    } else {
        mode = "direct";
        document.getElementById('mode').textContent = "Voir l'histoire";
        clear_grid();
        socket.emit("askPixels");
    }
}

function clear_grid() { // Efface la grille
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            let canvas = container.children[i*dim + j];
            let ctx = canvas.getContext("2d");
            canvas.style.border = "2px solid white";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, size_px+5, size_px+5);
        }
    }
}

window.onload = checkLoginStatus;