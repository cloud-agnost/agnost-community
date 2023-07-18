import useTypeStore from '@/store/types/typeStore';
import { translate } from '@/utils';
import * as z from 'zod';
import { BaseGetRequest, BaseRequest } from '.';

const NUMBER_REGEX = /^[0-9]+$/;
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
export const ConnectResourceSchema = z.object({
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
		.refine(
			(value) =>
				useTypeStore.getState().instanceTypes.database.includes(value) ||
				useTypeStore.getState().instanceTypes.storage.includes(value) ||
				useTypeStore.getState().instanceTypes.cache.includes(value) ||
				useTypeStore.getState().instanceTypes.queue.includes(value),
			{
				message: translate('forms.invalid', {
					label: translate('resources.database.instance'),
				}),
			},
		),
	allowedRoles: z.array(z.string()),
});
export const AccessDbSchema = z.object({
	host: z
		.string({
			required_error: translate('forms.required', {
				label: translate('resources.database.host'),
			}),
		})
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
	connFormat: z.enum(['mongodb', 'mongodb+srv']).optional(),
	port: z
		.string({
			required_error: translate('forms.required', { label: translate('resources.database.port') }),
		})
		.regex(NUMBER_REGEX, {
			message: translate('forms.invalid', { label: translate('resources.database.port') }),
		})
		.min(3, {
			message: translate('forms.invalid', { label: translate('resources.database.port') }),
		})
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', { label: translate('resources.database.port') }),
		),
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
	...ConnectResourceSchema.shape,
	access: AccessDbSchema,
	accessReadOnly: z.array(AccessDbSchema).optional(),
	secureConnection: z.boolean().default(false),
});

export const ConnectQueueSchema = z.object({
	...ConnectResourceSchema.shape,
	access: z.object({
		brokers: z.array(z.string()).optional(),
		format: z.enum(['url', 'object', 'ssl', 'sasl', 'simple']),
		url: z.string().optional(),
		host: z.string().optional(),
		port: z
			.string({
				required_error: translate('forms.required', {
					label: translate('resources.database.port'),
				}),
			})
			.regex(NUMBER_REGEX, {
				message: translate('forms.invalid', { label: translate('resources.database.port') }),
			})
			.min(3, {
				message: translate('forms.invalid', { label: translate('resources.database.port') }),
			})
			.trim()
			.refine(
				(value) => value.trim().length > 0,
				translate('forms.required', { label: translate('resources.database.port') }),
			),
		username: z.string().optional(),
		password: z.string().optional(),
		vhost: z.string().optional(),
		scheme: z.enum(['amqp', 'amqps']).optional(),
		clientId: z.string().optional(),
		ssl: z
			.object({
				rejectUnauthorized: z.boolean().optional(),
				ca: z.string().optional(),
				key: z.string().optional(),
				cert: z.string().optional(),
			})
			.optional(),
		sasl: z
			.object({
				mechanism: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']).optional(),
				username: z.string().optional(),
				password: z.string().optional(),
			})
			.optional(),
	}),
});

export interface AddExistingResourceRequest extends BaseRequest {
	name?: string;
	type: 'database' | 'cache' | 'storage' | 'queue';
	instance: string;
	allowedRoles: string[];
	access: {
		host?: string;
		port?: string;
		username?: string;
		password?: string;
		options?: {
			key?: string;
			value?: string;
		}[];
		accessIdKey?: string;
		secretAccessKey?: string;
		region?: string;
		projectId?: string;
		keyFileContents?: string;
		connectionString?: string;
		format?: 'url' | 'sasl' | 'object' | 'ssl' | 'simple';
		connFormat?: 'mongodb' | 'mongodb+srv';
		url?: string;
		vhost?: string;
		scheme?: 'amqp' | 'amqps';
		clientId?: string;
		brokers?: string[];
		ssl?: {
			rejectUnauthorized?: boolean;
			ca?: string;
			key?: string;
			cert?: string;
		};
		sasl?: { mechanism?: string; username?: string; password?: string };
	};
}
