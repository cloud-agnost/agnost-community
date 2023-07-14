import { RateLimit } from '@/types/version.ts';
import { Middleware } from '@/types/type.ts';

export interface Endpoint {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	method: string;
	path: string;
	fingerprint: string;
	timeout: number;
	apiKeyRequired: boolean;
	sessionRequired: boolean;
	logExecution: boolean;
	type: string;
	logic: string;
	rateLimits: RateLimit[];
	middlewares: Middleware[];
	createdBy: string;
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

export interface CreateEndpointParams extends EndpointBase {
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
export interface SaveEndpointLogicParams extends EndpointBase {
	epId: string;
	logic: string;
}

export type DeleteEndpointParams = GetEndpointByIdParams;
export interface DeleteMultipleEndpointsParams extends EndpointBase {
	endpointIds: string[];
}
export interface GetEndpointsParams extends EndpointBase {
	page: number;
	size: number;
	search?: string;
	start?: string;
	end?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
}
