import useTypeStore from '@/store/types/typeStore';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseRequest } from '.';
export interface Resource {
	orgId: string;
	iid: string;
	appId: string;
	versionId: string;
	name: string;
	type: string;
	instance: string;
	managed: boolean;
	deletable: boolean;
	allowedRoles: string[];
	config: {
		replicas: number;
		hpa: {
			avgCPU: number;
			avgMemory: number;
			minReplicas: number;
			maxReplicas: number;
		};
		cpu: {
			request: string;
			limit: string;
		};
		memory: {
			request: string;
			limit: string;
		};
	};
	access: {
		name: string;
		versionId: string;
		envId: string;
	};
	accessReadOnly: any[];
	status: string;
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export interface ResLog {
	orgId: string;
	appId: string;
	versionId: string;
	resourceId: string;
	action: string;
	status: string;
	createdBy: string;
	_id: string;
	logs: [];
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export interface GetResourcesRequest extends BaseGetRequest {
	appId: string;
	type?: string;
	instance?: string;
}
export interface Instance {
	id: string;
	name: string;
	icon: React.ElementType;
	isConnectOnly?: boolean;
}
export const AccessDbSchema = z.object({
	host: z
		.string()
		.nonempty({
			message: translate('forms.required', {
				label: translate('resources.database.host'),
			}),
		})
		.refine((value) => value.trim().length > 0, {
			message: translate('forms.required', {
				label: translate('resources.database.host'),
			}),
		}),
	// .refine(
	// 	(value) => {
	// 		URL_REGEX.test(value) || IP_REGEX.test(value);
	// 	},
	// 	{
	// 		message: translate('forms.invalid', {
	// 			label: translate('resources.database.host'),
	// 		}),
	// 	},
	// ),

	port: z
		.string()
		.regex(/^[0-9]+$/, 'Port must be a number')
		.min(3, 'Port must be at least 3 characters long')
		.trim()
		.refine((value) => value.trim().length > 0, "Port can't be empty"),
	username: z.string().nonempty({
		message: translate('forms.required', {
			label: translate('resources.database.username'),
		}),
	}),
	password: z.string().nonempty({
		message: translate('forms.required', {
			label: translate('resources.database.password'),
		}),
	}),
	dbName: z.string().optional().or(z.literal('')),
	options: z
		.array(
			z
				.object({
					key: z.string().optional().or(z.literal('')),
					value: z.string().optional().or(z.literal('')),
				})
				.superRefine((val, ctx) => {
					const { key, value } = val;
					if (key && !value) {
						return ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: translate('forms.required', {
								label: translate('resources.database.key'),
							}),
						});
					}
					if (!key && value) {
						return ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: translate('forms.required', {
								label: translate('resources.database.value'),
							}),
						});
					}
				}),
		)
		.optional(),
});
export const ConnectDatabaseSchema = z.object({
	name: z.string({
		required_error: translate('forms.required', {
			label: translate('general.name'),
		}),
	}),
	instance: z
		.string({
			required_error: translate('forms.required', {
				label: translate('resources.database.instance'),
			}),
		})
		.refine((value) => useTypeStore.getState().instanceTypes.database.includes(value), {
			message: translate('forms.invalid', {
				label: translate('resources.database.instance'),
			}),
		}),
	access: AccessDbSchema,
	allowedRoles: z.array(z.string()),
	accessReadOnly: z.array(AccessDbSchema).optional(),
	secureConnection: z.boolean().default(false),
});

export interface AddExistingResourceRequest extends BaseRequest {
	name?: string;
	type: 'database' | 'cache' | 'storage' | 'queue';
	instance: string;
	allowedRoles: string[];
	access: {
		host: string;
		port: string;
		username: string;
		password: string;
		options?: {
			key?: string;
			value?: string;
		}[];
	};
}
