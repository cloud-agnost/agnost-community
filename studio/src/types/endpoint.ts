import { BaseGetRequest, BaseRequest } from '@/types';
import { getPathParams, translate as t } from '@/utils';
import { AxiosError, AxiosResponse } from 'axios';
import * as z from 'zod';

export const NUMBER_REGEX = /^[0-9]+$/;
export const NAME_REGEX = /^[A-Za-z0-9_]+$/;
export const NOT_START_WITH_NUMBER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const ROUTE_NAME_REGEX = /^\/[a-zA-Z0-9_-]+(?:\/:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)*$/;
export const PARAM_REGEX = /:([^/?]+)/g;
export const PARAM_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

export const CreateEndpointSchema = z.object({
	name: z
		.string({
			required_error: t('forms.required', {
				label: t('general.name'),
			}),
		})
		.nonempty()
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
		.nonempty()
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
		.string({
			required_error: t('forms.required', {
				label: t('endpoint.create.timeout'),
			}),
		})
		.regex(
			NUMBER_REGEX,
			t('forms.number', {
				label: t('endpoint.create.timeout'),
			}),
		)
		.transform((val) => Number(val)),
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
	method: Method;
	path: string;
	fingerprint: string;
	timeout: string;
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

export interface EndpointBase {
	orgId: string;
	appId: string;
	versionId: string;
}

export interface CreateEndpointParams extends EndpointBase, BaseRequest {
	name: string;
	method: 'POST' | 'GET' | 'PUT' | 'DELETE';
	path: string;
	apiKeyRequired: boolean;
	sessionRequired: boolean;
	logExecution: boolean;
	timeout?: number;
	rateLimits?: string[];
	middlewares?: string[];
}

export type UpdateEndpointParams = CreateEndpointParams & {
	epId: string;
};

export interface GetEndpointByIdParams extends EndpointBase {
	epId: string;
}
export interface SaveEndpointLogicParams extends EndpointBase, BaseRequest {
	epId: string;
	logic: string;
}

export type DeleteEndpointParams = GetEndpointByIdParams;
export interface DeleteMultipleEndpointsParams extends EndpointBase {
	endpointIds: string[];
}

export interface GetEndpointsByIidParams extends EndpointBase {
	iids: string[];
}
export interface GetEndpointsParams extends EndpointBase, BaseGetRequest {}

export interface TestEndpointParams extends BaseRequest {
	epId: string;
	path: string;
	envId: string;
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
	}[];
}
export interface EndpointResponse extends AxiosResponse {
	epId: string;
	duration: number;
	response?: AxiosError['response'];
}
