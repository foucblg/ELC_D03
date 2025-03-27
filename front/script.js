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

function sendPixel(x, y, color) {
    socket.emit("placePixelInDB", { x, y, color });
}

function drawPixel(x, y, color) {
    let canvas = container.children[x * dim + y];
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size_px, size_px);
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
    sendMessage(`Pixel ${colorToString(color)} placé en x = ${x} et y = ${y}`);
});

socket.on("recieved_message", ({ user, text }) => {
    sendMessage(`${user} : ${text}`);
});


async function checkLoginStatus() {
    const res = await fetch("/login-status");
    const loginStatus = await res.json();
    const isLoggedIn = loginStatus.logged;
    sendMessage(loginStatus.text);
    if (isLoggedIn) {
        document.getElementById('signForm').style.display = 'none';
    }
    else {
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

function sendMessage(text) {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += text + "<br>";
    chatbox.scrollTop = chatbox.scrollHeight;
}
function colorToString(color){
    switch(color){
        case "green":
            return "vert";
        case "red":
            return "rouge";
        case "blue":
            return "bleu";
        case "black":
            return "noir";
        case "white":
            return "blanc";
        case "orange":
            return "orange";
        default:
            return "inconnue";
    }
}
window.onload = checkLoginStatus;