import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import i18next from 'i18next';
import { socket } from '@/helpers';
import * as z from 'zod';

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
export const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
		return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested =
				value instanceof z.ZodType ? zodKeys(value).map((subKey) => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
	// return empty array
	return [];
};
