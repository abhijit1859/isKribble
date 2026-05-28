import { Server } from "socket.io";
import { GameSocket } from "../sockets/GameSockets.js";

export class SocketConfig {
    public io: Server;
    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true,
            },
        });
        this.initializeSockets()

    }
    initializeSockets() {
        new GameSocket(this.io)
    }

}