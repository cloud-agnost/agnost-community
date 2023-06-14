import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import i18next from 'i18next';
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function removeLastSlash(str: string) {
	return str.replace(/\/$/, '');
}
export function translate(key: string, options?: any) {
	return String(i18next.t('key', options));
}
