import {
	NAME_REGEX,
	NOT_START_WITH_NUMBER_REGEX,
	PARAM_NAME_REGEX,
	ROUTE_NAME_REGEX,
} from '@/constants/regex';
import { BaseGetRequest, BaseParams, BaseRequest, Log } from '@/types';
import { getPathParams, translate as t } from '@/utils';
import { AxiosError, AxiosResponse } from 'axios';
import * as z from 'zod';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

export const CreateEndpointSchema = z.object({
	name: z
		.string({
			required_error: t('forms.required', {
				label: t('general.name'),
			}),
		})
		.regex(NAME_REGEX, {
			message: t('forms.invalid', {
				label: t('general.name'),
			}),
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
		),

	method: z
		.enum(HTTP_METHODS, {
			required_error: t('forms.required', {
				label: t('endpoint.create.path'),
			}),
		})
		.default('GET'),
	path: z
		.string({
			required_error: t('forms.required', {
				label: t('endpoint.create.path'),
			}),
		})
		.regex(ROUTE_NAME_REGEX, {
			message: t('endpoint.errors.notValidRoute'),
		})
		.startsWith('/', {
			message: t('forms.invalid', {
				label: t('endpoint.create.path'),
			}),
		})
		.superRefine((value, ctx) => {
			const parameterNames = getPathParams(value);

			// Validate parameter names
			for (const paramName of parameterNames) {
				if (!PARAM_NAME_REGEX.test(paramName)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('endpoint.errors.invalidParams', {
							param: paramName,
						}),
					});
				}
			}
			const uniqueParameterNames = new Set(parameterNames);
			if (uniqueParameterNames.size !== parameterNames.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('endpoint.errors.duplicateParam'),
				});
			}
		}),
	timeout: z
		.number({
			required_error: t('forms.required', {
				label: t('endpoint.create.timeout'),
			}),
		})
		.int()
		.positive()
		.optional()
		.nullish(),
	apiKeyRequired: z.boolean().default(false),
	sessionRequired: z.boolean().default(false),
	logExecution: z.boolean().default(false),
	rateLimits: z.array(z.string()).optional(),
	middlewares: z.array(z.string()).optional(),
});

export interface Endpoint {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	method: HttpMethod;
	path: string;
	fingerprint: string;
	timeout: number;
	apiKeyRequired: boolean;
	sessionRequired: boolean;
	logExecution: boolean;
	type: string;
	logic: string;
	rateLimits: string[];
	middlewares: string[];
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface CreateEndpointParams extends BaseParams, BaseRequest {
	name: string;
	method: HttpMethod;
	path: string;
	apiKeyRequired: boolean;
	sessionRequired: boolean;
	logExecution: boolean;
	timeout?: number | null;
	rateLimits?: string[];
	middlewares?: string[];
}

export type UpdateEndpointParams = CreateEndpointParams & {
	epId: string;
};

export interface GetEndpointByIdParams extends BaseParams {
	epId: string;
}
export interface SaveEndpointLogicParams extends BaseParams, BaseRequest {
	epId: string;
	logic: string;
}

export interface DeleteEndpointParams extends BaseParams, BaseRequest {
	epId: string;
}

export interface DeleteMultipleEndpointsParams extends BaseParams, BaseRequest {
	endpointIds: string[];
}

export interface GetEndpointsByIidParams extends BaseParams {
	iids: string[];
}
export interface GetEndpointsParams extends BaseParams, BaseGetRequest {}

export type TestMethods = 'get' | 'post' | 'put' | 'delete';
export interface TestEndpointParams extends BaseRequest {
	epId: string;
	path: string;
	envId: string;
	consoleLogId: string;
	params: {
		queryParams?: Record<string, string>;
		pathParams?: Record<string, string>;
	};
	body?: string;
	bodyType?: 'json' | 'form-data';
	headers?: Record<string, string>;
	method: 'get' | 'post' | 'put' | 'delete';
	formData?: {
		key: string;
		value?: string;
		file?: File;
		type: 'text' | 'file';
	}[];
}

interface TestResponse extends AxiosResponse {
	epId: string;
	duration?: string;
	response?: AxiosError['response'];
	logs?: Log[];
}
export interface EndpointResponse {
	[key: string]: TestResponse;
}
export interface EndpointRequest {
	[key: string]: TestEndpointParams;
}
