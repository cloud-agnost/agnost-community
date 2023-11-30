import {
	differenceInDays,
	differenceInMonths,
	differenceInYears,
	format,
	formatDistance,
	formatISO,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
export const DATE_FORMAT = 'yyyy/MM/dd';
export const TIME_FORMAT_WITH_SECONDS = 'hh:mm:ss a';
export const DATE_TIME_FORMAT = 'yyyy/MM/dd hh:mm:ss a';
export const DATE_FORMAT_MONTH_DAY_YEAR = 'MMM d, yyyy';
export const TIME_FORMAT = 'hh:mm a';
export const DATETIME_MED_WITH_SECONDS = 'MMM d, yyyy, hh:mm:ss a';
export const DATETIME_MED = 'MMM d, yyyy, hh:mm a';

export function formatDate(date: string | Date, formatString: string) {
	return format(new Date(date), formatString, {
		locale: enUS,
	});
}

export function getRelativeTime(date: string) {
	return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function convertDateToMilliseconds(dateString: string): number {
	return new Date(dateString).getTime();
}
export function calculateRecommendedBuckets(start: Date, end: Date): number {
	const years = differenceInYears(end, start);
	const months = differenceInMonths(end, start);
	const days = differenceInDays(end, start);

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

export function toIsoString(date: Date) {
	return formatISO(date);
}
