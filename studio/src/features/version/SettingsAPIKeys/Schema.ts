import * as z from 'zod';
import { isEmpty, translate } from '@/utils';
import { AUTHORIZATION_OPTIONS, ENDPOINT_ACCESS_PROPERTIES } from '@/constants';

const Schema = z.object({
	expiryDate: z.date().optional(),
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('general.name') }))
		.max(64, translate('forms.max64.error', { label: translate('general.name') }))
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		),
	realtime: z.boolean(),
	domain: z
		.object({
			type: z.enum(AUTHORIZATION_OPTIONS),
			list: z.array(
				z.object({
					domain: z
						.string()
						.url({ message: translate('forms.url.error').toString() })
						.optional()
						.or(z.literal('')),
				}),
			),
		})
		.superRefine(({ list, type }, ctx) => {
			const domains = list.map((value) => value.domain).filter(Boolean);
			if (type === 'specified' && isEmpty(domains)) {
				return ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: translate('forms.enterAtLeastOne', {
						label: translate('general.domain').toLowerCase(),
					}).toString(),
				});
			}
		}),
	ip: z
		.object({
			type: z.enum(AUTHORIZATION_OPTIONS),
			list: z.array(
				z.object({
					ip: z
						.string()
						.ip({ message: translate('forms.IP.error').toString() })
						.optional()
						.or(z.literal('')),
				}),
			),
		})
		.superRefine(({ list, type }, ctx) => {
			const ips = list.map((value) => value.ip).filter(Boolean);
			if (type === 'specified' && isEmpty(ips)) {
				return ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: translate('forms.enterAtLeastOne', {
						label: translate('general.IP').toLowerCase(),
					}).toString(),
				});
			}
		}),
	endpoint: z
		.object({
			type: z.enum(ENDPOINT_ACCESS_PROPERTIES, {
				required_error: 'You must select one of the options',
			}),
			allowedEndpoints: z.array(
				z.object({
					url: z.string().optional().or(z.literal('')),
				}),
			),
			excludedEndpoints: z.array(
				z.object({
					url: z.string().optional().or(z.literal('')),
				}),
			),
		})
		.superRefine(({ type, allowedEndpoints, excludedEndpoints }, ctx) => {
			if (type === 'custom-allowed') {
				const domains = allowedEndpoints.map((value) => value.url).filter(Boolean);
				if (isEmpty(domains)) {
					return ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: translate('forms.enterAtLeastOne', {
							label: translate('general.endpoint').toLowerCase(),
						}).toString(),
					});
				}
			} else if (type === 'custom-excluded') {
				const domains = excludedEndpoints.map((value) => value.url).filter(Boolean);
				if (isEmpty(domains)) {
					return ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: translate('forms.enterAtLeastOne', {
							label: translate('general.endpoint').toLowerCase(),
						}).toString(),
					});
				}
			}
		}),
});

export default Schema;
