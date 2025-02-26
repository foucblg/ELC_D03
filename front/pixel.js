class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    static fromJson(json) {
        const key = Object.keys(json)[0];
        const color = json[key];

        const coords = key.slice(1, -1).split(', ');
        const [x, y] = coords.map(Number);

        return new Pixel(x, y, color);
    }

    toJson() {
        return{ [`(${this.x}, ${this.y})`]: this.color };
    }
}