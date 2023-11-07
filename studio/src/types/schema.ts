import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants/regex';
import { translate as t } from '@/utils';
import * as z from 'zod';

export const NameSchema = z
	.string({
		required_error: t('forms.required', {
			label: t('general.name'),
		}),
	})
	.regex(NAME_REGEX, {
		message: t('forms.nameInvalidCharacters'),
	})
	.regex(NOT_START_WITH_NUMBER_REGEX, {
		message: t('forms.notStartWithNumber', {
			label: t('general.name'),
		}),
	})
	.min(2, {
		message: t('forms.min2.error', {
			label: t('general.name'),
		}),
	})
	.max(64, {
		message: t('forms.max64.error', {
			label: t('general.name'),
		}),
	})
	.trim()
	.refine(
		(value) => value.trim().length > 0,
		t('forms.required', {
			label: t('general.name'),
		}),
	)
	.refine((value) => !value.startsWith('_'), {
		message: t('forms.notStartWithUnderscore', {
			label: t('general.name'),
		}),
	})
	.refine(
		(value) => value !== 'this',
		(value) => ({
			message: t('forms.reservedKeyword', {
				keyword: value,
				label: t('general.name'),
			}),
		}),
	);

export const FieldSchema = z
	.string()
	.min(2, t('forms.min2.error', { label: t('general.field') }))
	.max(64, t('forms.max64.error', { label: t('general.field') }))
	.regex(/^[a-zA-Z0-9_]*$/, {
		message: t('forms.alphanumeric', { label: t('general.field') }),
	})
	.or(z.literal(''));

export const TimestampsSchema = z
	.object({
		enabled: z.boolean(),
		createdAt: FieldSchema,
		updatedAt: FieldSchema,
	})
	.superRefine((arg, ctx) => {
		if (arg.enabled) {
			Object.entries(arg).forEach(([key, value]) => {
				if (key !== 'enabled' && typeof value === 'string' && value.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: t('general.field'),
						}),
						path: [key],
					});
				}
			});
		}
	});
