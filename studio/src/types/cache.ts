import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants/regex';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';

export interface Cache {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	assignUniqueName: boolean;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export type GetCachesOfAppVersionParams = BaseParams & BaseGetRequest;
export type GetCacheByIdParams = BaseParams & {
	cacheId: string;
};
export interface DeleteMultipleCachesParams extends BaseParams, BaseRequest {
	cacheIds: string[];
}
export type DeleteCacheParams = GetCacheByIdParams & BaseRequest;
export interface CreateCacheParams extends BaseParams, BaseRequest {
	name: string;
	assignUniqueName: boolean;
	resourceId: string;
}
export type UpdateCacheParams = GetCacheByIdParams & Partial<Cache> & BaseRequest;

export const CacheSchema = z.object({
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
	assignUniqueName: z.boolean().default(false),
});
export const CreateCacheSchema = z.object({
	...CacheSchema.shape,
	resourceId: z.string({
		required_error: translate('forms.required', {
			label: translate('queue.create.resource.title'),
		}),
	}),
});
