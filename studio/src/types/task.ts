import { NAME_REGEX, NOT_START_WITH_NUMBER_REGEX } from '@/constants';
import { translate } from '@/utils';
import parser from 'cron-parser';
import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';
export interface Task {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	logExecution: boolean;
	resourceId: string;
	type: 'code' | 'flow';
	logic: string;
	cronExpression: string;
	createdBy: string;
	updatedBy: string;
	__v: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export const CreateTaskSchema = z.object({
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
	type: z.enum(['code', 'flow']).default('code'),
	cronExpression: z
		.string({
			required_error: translate('forms.required', {
				label: translate('task.syntax'),
			}),
		})
		.nonempty()
		.superRefine((value, ctx) => {
			try {
				parser.parseExpression(value);
				return true;
			} catch (e) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: translate('forms.invalid', {
						label: translate('task.syntax'),
					}),
				});
				return false;
			}
		}),
});

export interface CreateTaskParams extends BaseParams, BaseRequest {
	name: string;
	logExecution: boolean;
	type: 'code' | 'flow';
	cronExpression: string;
	resourceId: string;
}
export interface UpdateTaskParams extends CreateTaskParams {
	taskId: string;
}
export interface DeleteTaskParams extends BaseRequest, BaseParams {
	taskId: string;
}
export interface DeleteMultipleTasksParams extends BaseRequest, BaseParams {
	taskIds: string[];
}
export interface GetTaskParams extends BaseParams {
	taskId: string;
}
export type GetTasksParams = BaseGetRequest & BaseParams;

export interface SaveTaskLogicParams extends BaseParams, BaseRequest {
	taskId: string;
	logic: string;
}

export interface TestTaskParams extends BaseParams, BaseRequest {
	taskId: string;
	debugChannel: string;
}
export interface TestTaskLogs {
	[key: string]: string[];
}
