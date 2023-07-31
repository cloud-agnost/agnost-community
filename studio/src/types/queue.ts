import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';
const NUMBER_REGEX = /^[0-9]+$/;
export const NAME_REGEX = /^[A-Za-z0-9_]+$/;
export const NOT_START_WITH_NUMBER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
export interface MessageQueue {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	logExecution: boolean;
	delay: number;
	type: 'code' | 'flow';
	logic: string;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export type GetMessageQueuesParams = BaseParams & BaseGetRequest;
export interface GetMessageQueueByIdParams extends BaseParams {
	queueId: string;
}
export type DeleteMessageQueueParams = GetMessageQueueByIdParams & BaseRequest;
export interface DeleteMultipleQueuesParams extends BaseParams, BaseRequest {
	queueIds: string[];
}

export const CreateMessageQueueSchema = z.object({
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

	logExecution: z.boolean().default(false),
	delay: z
		.string({
			required_error: translate('forms.required', {
				label: translate('endpoint.create.timeout'),
			}),
		})
		.regex(
			NUMBER_REGEX,
			translate('forms.number', {
				label: translate('endpoint.create.timeout'),
			}),
		),
});

export interface CreateMessageQueueParams extends BaseRequest, BaseParams {
	name: string;
	logExecution: boolean;
	delay: string;
	resourceId: string;
}
export interface UpdateQueueParams extends CreateMessageQueueParams {
	queueId: string;
}
export interface UpdateQueueLogicParams extends BaseRequest, BaseParams {
	logic: string;
	queueId: string;
}
