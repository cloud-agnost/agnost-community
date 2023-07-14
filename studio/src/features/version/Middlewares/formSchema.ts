import * as z from 'zod';
import { translate } from '@/utils';

export const nameSchema = z
	.string({
		required_error: translate('forms.required', {
			label: translate('general.name'),
		}),
	})
	.min(2, translate('forms.min2.error', { label: translate('general.name') }))
	.max(64, translate('forms.max64.error', { label: translate('general.name') }))
	.regex(/^[a-zA-Z0-9]*$/, {
		message: translate('forms.alphanumeric', { label: translate('general.name') }),
	})
	.trim()
	.refine(
		(value) => value.trim().length > 0,
		translate('forms.required', {
			label: translate('general.name'),
		}),
	);

export const logicSchema = z
	.string({
		required_error: translate('forms.required', {
			label: translate('version.handler_code'),
		}),
	})
	.trim()
	.refine(
		(value) => value.trim().length > 0,
		translate('forms.required', {
			label: translate('version.handler_code'),
		}),
	);
