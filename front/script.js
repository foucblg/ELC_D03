var size_px = 20;
var dim = 5;
var id_clicked = 0
var container = document.getElementById("gridContainer");
var color_picked = "green";

for (var i = 0; i < dim; i++) {
    for (var j = 0; j < dim; j++) {
        let canvas = document.createElement("canvas");
        canvas.width = size_px;
        canvas.height = size_px;
        container.appendChild(canvas);

        
        canvas.addEventListener("click", (function(i, j) {
            return function() {
                selectCanvas(i, j);
            };
        })(i, j));
    }
}

function selectCanvas(i, j) {
    container.children[id_clicked].style.border = "none";
    id_clicked = i*dim + j;
    container.children[id_clicked].style.border = "2px solid red";
}


function drawInCanvas(id) {
    let canvas = container.children[id];
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = color_picked;
    ctx.fillRect(0, 0, size_px, size_px);
}

var colorBoxes = document.querySelectorAll(".color-box");
colorBoxes.forEach(function(box) {
    box.addEventListener("click", function() {
        color_picked = box.getAttribute("data-color");
        drawInCanvas(id_clicked);
        container.children[id_clicked].style.border = "none";
    });
});