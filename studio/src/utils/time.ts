import { DateTime } from 'luxon';

export function formatDate(date: string | Date, option: Intl.DateTimeFormatOptions) {
	const dt = date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
	return dt.setLocale('en').toLocaleString(option);
}
