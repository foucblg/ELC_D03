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
            return function() {
                selectCanvas(i, j);
            };
        })(i, j));
    }
}

var colorBoxes = document.querySelectorAll(".color-box");
colorBoxes.forEach(function(box) {
    box.addEventListener("click", function() {
        if (id_clicked == -1) return;
        color_picked = box.getAttribute("data-color");
        drawInCanvas(id_clicked);
        sendPixel(x, y, color_picked);
    });
});

function selectCanvas(i, j) {
    console.log("oui");
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

function sendPixel(x, y, color) {
    socket.emit("placePixel", { x, y, color });
}

function drawPixel(x, y, color) {
    let canvas = container.children[x * dim + y];
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size_px, size_px);
}
function drawInCanvas(id) {
    let canvas = container.children[id];
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = color_picked;
    ctx.fillRect(0, 0, size_px+5, size_px+5);
    canvas.style.border = `2px solid ${color_picked}`;
    id_clicked = -1;
    drawed = true;
}

socket.on("loadPixels", (pixels) => {
    pixels.forEach(({ x, y, color }) => {
        color_picked = color;
        drawInCanvas(x * dim + y);
    });
});

socket.on("placePixel", ({ x, y, color }) => {
    drawInCanvas(x, y, color);
});