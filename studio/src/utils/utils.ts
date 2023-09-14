import { PARAM_REGEX } from '@/constants';
import { socket } from '@/helpers';
import { useToast as toast } from '@/hooks';
import { t } from '@/i18n/config.ts';
import useApplicationStore from '@/store/app/applicationStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { AppRoles, OrgRoles, RealtimeData, ToastType } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import the Monaco API
import * as prettier from 'prettier';
import jsParser from 'prettier/plugins/babel';
import esTreePlugin from 'prettier/plugins/estree';
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
	return String(t(key, options));
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
	if (value === null || value === undefined || value === '') {
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
	if (!name) {
		return '';
	}

	const words = name.trim().split(' ');

	if (words.length === 1) {
		if (words[0].length === 1) {
			return words[0];
		} else if (words[0].length === 2) {
			return words[0].toUpperCase();
		} else {
			return words[0].slice(0, 2).toUpperCase();
		}
	} else {
		const firstInitial = words[0][0];
		const lastInitial = words[words.length - 1][0];
		return (firstInitial + lastInitial).toUpperCase();
	}
}
export function capitalize(str: string) {
	if (typeof str !== 'string') {
		return '';
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
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
export const reorder = (list: any[], startIndex: number, endIndex: number) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

export function getPathParams(path: string) {
	const params: string[] = [];

	let match;
	while ((match = PARAM_REGEX.exec(path)) !== null) {
		params.push(match[1]);
	}

	return params;
}

export function getEndpointPath(path: string, params: Record<string, string>) {
	const pathParams = getPathParams(path);

	for (const param of pathParams) {
		path = path.replace(`:${param}`, params[param]);
	}

	return path;
}

export function arrayToObj(arr: { key: string; value: string }[]): Record<string, string> {
	return arr.reduce(
		(acc, curr) => {
			acc[curr.key] = curr.value;
			return acc;
		},
		{} as Record<string, string>,
	);
}

export function objToArray(obj: object | undefined): { key: string; value: string }[] {
	return Object.entries(obj ?? {}).map(([key, value]) => ({ key, value }));
}

export function generateId() {
	return Math.random().toString(36).substring(2, 15);
}

export function toDisplayName(name: string) {
	return name.replace(/-/g, ' ').split(' ').map(capitalize).join(' ');
}

export default function groupBy<T>(list: T[], keyGetter: (item: T) => string) {
	const map: Record<string, T[]> = {};

	for (const item of list) {
		const key = keyGetter(item);
		const collection = map[key];
		if (!collection) {
			map[key] = [item];
		} else {
			collection.push(item);
		}
	}

	return map;
}
export const getPermission = (permissions: any, pathParts: string[]): boolean | undefined => {
	let entity = permissions;
	for (let i = 0; i < pathParts.length - 1; i++) {
		entity = entity[pathParts[i]];
		if (!entity) break;
	}

	if (entity && entity[pathParts[pathParts.length - 1]])
		return entity[pathParts[pathParts.length - 1]];
};

export const getAppPermission = (userRole: AppRoles, path: string) => {
	const pathParts = path.split('.');
	const userPermissions = useApplicationStore.getState().appAuthorization;
	if (userPermissions[userRole]) {
		const currentPermissions = userPermissions[userRole];
		const permission = getPermission(currentPermissions, pathParts);
		return permission;
	}
	return undefined;
};

export const getOrgPermission = (path: string) => {
	const pathParts = path.split('.');
	const userPermissions = useOrganizationStore.getState().orgAuthorization;
	const role = useOrganizationStore.getState().organization?.role as OrgRoles;
	if (userPermissions[role]) {
		const currentPermissions = userPermissions[role];
		const permission = getPermission(currentPermissions, pathParts);

		return permission;
	}
	return undefined;
};
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const units: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const base = 1024;
	const exponent: number = Math.floor(Math.log(bytes) / Math.log(base));

	return parseFloat((bytes / Math.pow(base, exponent)).toFixed(2)) + ' ' + units[exponent];
}

export function checkNumber(number: number | undefined): number | undefined {
	return number === 0 || number === undefined ? undefined : Number(number);
}

export async function formatCode(code: string) {
	return await prettier.format(code, {
		parser: 'babel',
		plugins: [jsParser, esTreePlugin],
	});
}
export async function saveEditorContent(
	ed: monaco.editor.IStandaloneCodeEditor,
	language: 'javascript' | 'json',
	cb?: (value: string) => void,
) {
	console.log('formatting', ed);
	if (language === 'json') {
		ed.trigger('', 'editor.action.formatDocument', null);
	}
	if (language === 'javascript') {
		const formatted = await formatCode(ed.getValue());
		// Select all text
		const fullRange = ed.getModel()?.getFullModelRange();

		// Apply the text over the range
		ed.executeEdits(null, [
			{
				text: formatted,
				range: fullRange as monaco.Range,
			},
		]);

		ed.pushUndoStop();
	}
	cb?.(ed.getValue());
}
