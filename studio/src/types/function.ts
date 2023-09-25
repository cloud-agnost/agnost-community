import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';

export interface HelperFunction {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	type: 'code' | 'flow';
	logic: string;
	createdBy: string;
	updatedBy?: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export type GetFunctionsOfAppVersion = BaseParams & BaseGetRequest;
export type GetFunctionByIdParams = BaseParams & {
	funcId: string;
};
export interface DeleteMultipleFunctions extends BaseParams, BaseRequest {
	functionIds: string[];
}
export type DeleteFunctionParams = GetFunctionByIdParams & BaseRequest;
export interface CreateFunctionParams extends BaseParams, BaseRequest {
	name: string;
}
export type UpdateFunctionParams = GetFunctionByIdParams & Partial<HelperFunction> & BaseRequest;
export interface SaveFunctionCodeParams extends GetFunctionByIdParams, BaseRequest {
	logic: string;
}
export const CreateFunctionSchema = z.object({
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
});
