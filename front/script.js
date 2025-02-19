var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var size = 20;
var width = canvas.width/size;
var height = canvas.height/size;
var tab = Array.from({ length: height }, () => Array(width).fill(0));

paint(tab);
canvas.addEventListener("click", function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    tab[Math.floor(y / 20)][Math.floor(x / 20)] = 1;
    paint(tab);
});

function paint(tab){
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            if (tab[i][j] == 1) {
                ctx.fillStyle = "green";
                ctx.fillRect(j * size,i * size, size,size);
            }
        }
    }
}