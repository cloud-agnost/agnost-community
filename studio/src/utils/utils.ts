import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import i18next from 'i18next';
import { socket } from '@/helpers';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function removeLastSlash(str: string) {
	return str.replace(/\/$/, '');
}
export function translate(key: string, options?: any) {
	return String(i18next.t(key, options));
}

export function joinChannel(channel: string) {
	socket.emit('channel:join', channel);
}
export function leaveChannel(channel: string) {
	socket.emit('channel:leave', channel);
}
export function sendChannelMessage(channel: string, message: string) {
	socket.emit('channel:message', { channel, message });
}
