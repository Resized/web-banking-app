const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { SECRET_ACCESS_TOKEN } = require('../config');
const Blacklist = require('../models/blacklist');

const clients = new Map();

async function webSocket(expressServer) {
    const wss = new WebSocket.Server({
        noServer: true,
        path: '/api/transactions/events'
    });

    expressServer.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (websocket) => {
            wss.emit("connection", websocket, request);
        });
    });

    wss.on('connection', (ws, request) => {
        const params = new URLSearchParams(request.url.split('?')[1]);
        const token = params.get('token');

        if (!token) {
            ws.close(1008, 'Missing access token');
            return;
        }

        jwt.verify(token, SECRET_ACCESS_TOKEN, async (err, user) => {
            if (err) {
                ws.close(1008, 'Invalid access token');
                return;
            }

            const checkIfBlacklisted = await Blacklist.findOne({ token });
            if (checkIfBlacklisted) {
                ws.close(1008, 'Token blacklisted');
                return;
            }

            // Attach user information to WebSocket connection
            ws.user = user;
            const websocketsSet = clients.get(user.email);
            if (websocketsSet) {
                clients.set(user.email, websocketsSet.add(ws));
            } else {
                clients.set(user.email, new Set([ws]));
            }

            ws.on('close', () => {
                console.log('Client disconnected');
                const websocketsSet = clients.get(user.email);
                websocketsSet.delete(ws);
                if (websocketsSet.size === 0)
                    clients.delete(user.email);
            });
        });
    });
}

module.exports = { clients, webSocket };
