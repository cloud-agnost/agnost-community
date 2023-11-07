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
