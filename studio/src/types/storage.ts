import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants/regex';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';
export interface Storage {
	_id: string;
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateStorageParams extends BaseParams, BaseRequest {
	name: string;
	resourceId: string;
}
export type GetStoragesParams = BaseParams & BaseGetRequest;

export interface GetStorageByIdParams extends BaseParams {
	storageId: string;
}
export interface UpdateStorageParams extends CreateStorageParams {
	storageId: string;
}
export interface DeleteStorageParams extends BaseRequest, BaseParams {
	storageId: string;
}
export interface DeleteMultipleStoragesParams extends BaseRequest, BaseParams {
	storageIds: string[];
}
export const StorageSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.nonempty()
		.regex(NAME_REGEX, {
			message: translate('forms.invalid', {
				label: translate('general.name'),
			}),
		})
		.min(2, {
			message: translate('forms.min2.error', {
				label: translate('general.name'),
			}),
		})
		.max(64, {
			message: translate('forms.max64.error', {
				label: translate('general.name'),
			}),
		})
		.trim()
		.regex(NOT_START_WITH_NUMBER_REGEX, {
			message: translate('forms.notStartWithNumber', {
				label: translate('general.name'),
			}),
		})
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		)
		.refine((value) => !value.startsWith('_'), {
			message: translate('forms.notStartWithUnderscore', {
				label: translate('general.name'),
			}),
		})
		.refine(
			(value) => value !== 'this',
			(value) => ({
				message: translate('forms.reservedKeyword', {
					keyword: value,
					label: translate('general.name'),
				}),
			}),
		),
	resourceId: z.string({
		required_error: translate('forms.required', {
			label: translate('queue.create.resource.title'),
		}),
	}),
});
