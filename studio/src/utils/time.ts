import { DateTime } from 'luxon';

export function formatDate(date: string | Date, option: Intl.DateTimeFormatOptions) {
	const dt = date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
	return dt.setLocale('en').toLocaleString(option);
}

export function getRelativeTime(date: string) {
	return DateTime.fromISO(date).setLocale('en').toRelative();
}

export function convertDateToMilliseconds(dateString: string): number {
	return new Date(dateString).getTime();
}
export function calculateRecommendedBuckets(start: Date, end: Date): number {
	const startDate = DateTime.fromJSDate(start);
	const endDate = DateTime.fromJSDate(end);
	const { years, months, days } = endDate.diff(startDate, ['years', 'months', 'days']);

	const totalMonths = years * 12 + months;
	const totalDays = months * 30 + days;

	if (years && totalMonths < 30) {
		return Math.floor(totalMonths);
	}

	if (months && totalDays < 30) {
		return Math.floor(totalDays);
	}

	if (years > 0) {
		return years === 1 ? 12 : Math.floor(years + 1);
	}

	if (months && months > 0) {
		return months === 1 && !days ? 30 : Math.floor(months + 1);
	}

	if (days && days > 0) {
		return days > 1 ? Math.floor(days + 1) : 24;
	}

	return 24;
}
export function formatTime(timeInMilliseconds: number) {
	if (timeInMilliseconds === 0) return undefined;
	if (timeInMilliseconds < 1000) {
		// If the time is less than 1 second, format it in milliseconds
		return `${timeInMilliseconds.toFixed()} ms`;
	} else {
		// If the time is 1 second or more, format it in seconds with one decimal place
		const seconds = (timeInMilliseconds / 1000).toFixed(1);
		return `${seconds} s`;
	}
}
