// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
export function hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

export function colorToString(color){
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