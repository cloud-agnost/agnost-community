import { socket } from '@/helpers';
import { useToast as toast } from '@/hooks';
import { ToastType } from '@/types';
import { RealtimeData } from '@/types/type';
import { clsx, type ClassValue } from 'clsx';
import i18next from 'i18next';
import { DateTime } from 'luxon';
import { twMerge } from 'tailwind-merge';

type EmptyableArray = readonly [] | [];
type EmptyableString = '' | string;
type EmptyableObject<T extends object> = T & Record<keyof T, never>;

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
export function offChannelMessage(channel: string) {
	socket.off(channel);
}

export function onChannelMessage<T>(channel: string, callback: (data: RealtimeData<T>) => void) {
	socket.on(channel, callback);
	return () => {
		socket.off(channel);
	};
}

export function uniq<T>(array: T[]): T[] {
	return [...new Set(array)];
}

export function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === 'string' || Array.isArray(value)) {
		return (value as EmptyableString | EmptyableArray).length === 0;
	}

	if (
		typeof value === 'object' &&
		Object.keys(value as EmptyableObject<Record<string, unknown>>).length === 0
	) {
		return true;
	}

	return false;
}
export function isArray<T>(value: unknown): value is T[] {
	return Array.isArray(value);
}
export function getNameForAvatar(name: string) {
	if (name?.length > 2) {
		const names = name.split(' ');
		return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
	} else {
		return name;
	}
}
export function capitalize(str: string) {
	if (typeof str !== 'string') {
		return '';
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRelativeTime(date: string) {
	return DateTime.fromISO(date).setLocale('en').toRelative();
}

export function notify(params: ToastType) {
	return toast().notify(params);
}
export function arrayToQueryString(array: string[], key: string) {
	return array.map((item) => `${key}=${item}`).join('&');
}

export async function copy(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		notify({
			title: translate('general.success'),
			description: translate('general.copied'),
			type: 'success',
		});
	} catch (e) {
		notify({
			title: translate('general.error'),
			description: translate('general.copied_error'),
			type: 'error',
		});
	}
}

export function reverseArray<T>(arr: T[]) {
	const reversedArray: T[] = [];

	for (let i = arr.length - 1; i >= 0; i--) {
		reversedArray.push(arr[i]);
	}

	return reversedArray;
}

export async function lazyRouteImport(path: string) {
	const { default: Component } = await import(path);

	return {
		Component,
		loader: Component.loader,
	};
}
