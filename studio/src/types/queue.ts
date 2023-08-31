import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants/regex';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';

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
	delay: z.coerce.number().int().positive().optional(),
	resourceId: z.string({
		required_error: translate('forms.required', {
			label: translate('queue.create.resource.title'),
		}),
	}),
});

export interface CreateMessageQueueParams extends BaseRequest, BaseParams {
	name: string;
	logExecution: boolean;
	delay?: number;
	resourceId: string;
}
export interface UpdateQueueParams extends CreateMessageQueueParams {
	queueId: string;
}
export interface UpdateQueueLogicParams extends BaseRequest, BaseParams {
	logic: string;
	queueId: string;
}
export interface TestQueueParams extends BaseRequest, BaseParams {
	queueId: string;
	debugChannel: string;
	payload: Record<string, string>;
}

export interface TestQueueLogs {
	[key: string]: {
		payload: Record<string, string>;
		logs?: string[];
	};
}
