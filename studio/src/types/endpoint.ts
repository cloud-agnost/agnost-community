import { BaseGetRequest, Middleware } from '@/types/type.ts';
import { RateLimit } from '@/types/version.ts';

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface Endpoint {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	method: Method;
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

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

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

export interface GetEndpointsByIidParams extends EndpointBase {
	iids: string[];
}
export interface GetEndpointsParams extends EndpointBase, BaseGetRequest {}
