import { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setIo(instance: Server) {
	ioInstance = instance;
}

export function getIo(): Server | null {
	return ioInstance;
}


