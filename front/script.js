var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var tab = [[1, 0, 0],
           [0, 1, 0],
           [0, 0, 1]];

for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
        if (tab[i][j] == 1) {
            ctx.fillStyle = "green";
            ctx.fillRect(j * 10,i * 10, 10,10);
        }
    }
}