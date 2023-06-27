import { DateTime } from 'luxon';

export function formatDate(date: string, option: Intl.DateTimeFormatOptions) {
	const dt = DateTime.fromISO(date);
	return dt.setLocale('en').toLocaleString(option);
}
