import { Server } from "socket.io";
import { colorToString } from './utils.js';
import { placePixel, placeMessage, loadPixels, loadMessages, getUserIdByToken } from './cruds.js';
import cookie from 'cookie';

export function setupSocket(server){
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('WS co');

        let token = null;
        if (socket.handshake.headers.cookie) {
            console.log("ouiiiii")
            token = cookie.parse(socket.handshake.headers.cookie).access_token;
            console.log(`WS token < ${token}, userId ${getUserIdByToken(token)}`)
        }

        socket.on('placePixelInDB', ({ x, y, color }) => {
            console.log(`WS placePixelInDB < reçu > ${JSON.stringify({ x, y, color })}`);
            if (token) {
                if (placePixel(x, y, color, token)) {
                    let text = `<i> Pixel ${colorToString(color)} placé en (${x}, ${y}) </i>`;
                    let msg = placeMessage(text, token);
                    if (msg.success) {
                        io.emit('placeMessageOnScreen', msg);
                    }
                    io.emit('placePixelOnScreen', { x, y, color });
                    console.log(`WS placePixelOnScreen < émis > ${JSON.stringify({ x, y, color, token })}`)
                }
            } else {
                console.log(`WS placePixel < refus d'émettre (pas de token) > ${JSON.stringify({ x, y, color })}`);
            }
        });

        socket.on('placeMessageInDB', ({ text }) => {
            console.log(`WS placeMessageInDB < reçu > ${text}`);
            if (token) {
                let msg = placeMessage(text.replace(/<[^>]+>/g, ''), token);
                if (msg.success) {
                    io.emit('placeMessageOnScreen', msg);
                    console.log(`WS placeMessageOnScreen < émis > ${JSON.stringify({ ...msg, token })}`)
                }
            } else {
                console.log(`WS placeMessage < refus d'émettre (pas de token) > ${text}`);
            }
        });

        socket.on('askPixels', () => {
            socket.emit('loadPixels', loadPixels());
        });
        
        socket.emit('loadPixels', loadPixels());
        socket.emit('loadMessages', loadMessages());

        socket.on('disconnect', () => {
            console.log("WS déco");
        });
    });
}