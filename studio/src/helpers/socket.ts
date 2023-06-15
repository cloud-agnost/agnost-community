import { io } from 'socket.io-client';

const URL = `${window.location.origin}/sync`;

export const socket = io(URL, {
	reconnection: true,
	reconnectionDelay: 500,
	transports: ['websocket', 'polling'],
});
