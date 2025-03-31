const socket = io();
var size_px = 20;
var dim = 20;
var id_clicked = -1;
var container = document.getElementById("gridContainer");
container.style.gridTemplateColumns = `repeat(${dim}, ${size_px+4}px)`;
var color_picked = "green";
var drawed = false;
var previous_id_clicked = -1;
var x;
var y;
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
            return async function()  {
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
    const res = await fetch("/login-status");
    const loginStatus = await res.json();
    const isLoggedIn = loginStatus.logged;
    if (isLoggedIn){
        if (!drawed && previous_id_clicked != -1) {
            container.children[previous_id_clicked].style.border = "None";
        }
        x = i;
        y = j;
        id_clicked = i*dim + j;
        container.children[id_clicked].style.border = "2px solid red";
        previous_id_clicked = id_clicked;
        drawed = false;
    }
}

// https://dev.to/inezabonte/how-to-make-a-mini-messenger-with-javascript-for-beginners-mm3
const messageForm = document.getElementById('messageForm');
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
    socket.emit("placePixelInDB", { x, y, color });
}

function sendMessage(text) {
    socket.emit("placeMessageInDB", { text });
}

function drawPixel(x, y, color) {
    let canvas = container.children[x * dim + y];
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size_px, size_px);
}

function showMessage(text) {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += text + "<br>";
    chatbox.scrollTop = chatbox.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function drawInCanvas(id) {
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

socket.on("loadPixels", async (pixels) => {
    for (let pixel of pixels) {
        let {x, y, color} = pixel;
        color_picked = color;
        drawInCanvas(x * dim + y);
    }
});

socket.on("placePixelOnScreen", ({ x, y, color }) => {
    color_picked = color;
    drawInCanvas(x * dim + y);
});

socket.on("loadMessages", async (messages) => {
    for (let message of messages) {
        let {text} = message;
        showMessage(text);
    }
});

socket.on("placeMessageOnScreen", ({ text }) => {
    showMessage(text);
});

async function checkLoginStatus() {
    const res = await fetch("/login-status");
    const loginStatus = await res.json();
    const isLoggedIn = loginStatus.logged;
    // TODO: faire apparaître loginStatus.text qq part sur la page
    if (isLoggedIn) {
        document.getElementById('signForm').style.display = 'none';
    }
    else {
        document.getElementById('messageForm').style.display = 'none';
        document.getElementById('logoutForm').style.display = 'none';
        document.getElementById('colorPicker').style.display = 'none';
    }
}

async function history() {
    const res = await fetch("/history");
    const pixels = res.json();
    for (let pixel of pixels) {
        let {x, y, color} = pixel;
        color_picked = color;
        drawInCanvas(x*dim + y);
        await sleep(100);
    }
}

window.onload = checkLoginStatus;