import { socket } from '@/helpers';
import { clsx, type ClassValue } from 'clsx';
import i18next from 'i18next';
import { DateTime } from 'luxon';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function removeLastSlash(str: string) {
	if (str === '/') return str;
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
export function sendMessageToChannel(channel: string, message: string) {
	socket.emit('channel:message', { channel, message });
}

export function onChannelMessage<T>(channel: string, callback: (data: T) => void) {
	socket.on(channel, callback);
	return () => {
		socket.off(channel);
	};
}
export function getNameForAvatar(name: string) {
	if (name?.length > 2) {
		const names = name.split(' ');
		return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
	} else {
		return name;
	}
}
export function getRelativeTime(date: string) {
	return DateTime.fromISO(date).toRelative();
}
export function getApplicationRoleVariant(role: string) {
	switch (role) {
		case 'Admin':
			return 'orange';
		case 'Developer':
			return 'purple';
		case 'Viewer':
			return 'blue';
		default:
			return 'green';
	}
}
