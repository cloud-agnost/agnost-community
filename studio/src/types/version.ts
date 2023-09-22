import { HttpMethod } from '.';
import { BaseGetRequest, BaseParams, User } from './type';

export interface APIKey {
	expiryDate?: string;
	updatedBy?: string;
	name: string;
	key: string;
	allowRealtime: true;
	type: APIKeyTypes;
	allowedEndpoints: string[];
	excludedEndpoints: string[];
	domainAuthorization: AllAndSpecified;
	authorizedDomains: string[];
	IPAuthorization: AllAndSpecified;
	authorizedIPs: string[];
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
}
export type APIKeyTypes = 'no-access' | 'full-access' | 'custom-allowed' | 'custom-excluded';
export type AllAndSpecified = 'all' | 'specified';
export type VersionLogTypes = 'endpoint' | 'queue' | 'task';
export interface VersionLog {
	_id: string;
	timestamp: string;
	name: string;
	status: 'success' | 'error';
	duration: number;
	orgId: string;
	appId: string;
	versionId: string;
	envId: string;
	queueId?: string;
	taskId?: string;
	epId?: string;
	message: any;
	errors: any;
}

export interface GetVersionLogsParams extends BaseGetRequest, BaseParams {
	type: VersionLogTypes;
}
export interface VersionLogBucket {
	totalHits: number;
	buckets: {
		bucket: number;
		start: string;
		end: string;
		success: number;
		error: number;
	}[];
}

export interface GetVersionLogBucketsParams extends BaseParams {
	buckets: number;
	type: VersionLogTypes;
	start: string;
	end: string;
}

export interface RateLimit {
	_id: string;
	iid: string;
	createdBy: string | User;
	updatedBy: string | User;
	createdAt: string;
	updatedAt: string;
	name: string;
	rate: number;
	duration: number;
	errorMessage: string;
}

export interface Version {
	orgId: string;
	appId: string;
	iid: string;
	name: string;
	private: boolean;
	readOnly: boolean;
	master: boolean;
	realtime: VersionRealtimeProperties;
	defaultEndpointLimits: string[];
	authentication: {
		email: {
			customSMTP: {
				useTLS: boolean;
			};
			enabled: boolean;
			confirmEmail: boolean;
			expiresIn: number;
		};
		phone: {
			enabled: boolean;
			confirmPhone: boolean;
			allowCodeSignIn: boolean;
			smsProvider: string;
			expiresIn: number;
		};
		redirectURLs: string[];
		providers: [];
		messages: [];
	};
	createdBy: string;
	updatedBy: string;
	_id: string;
	params: Param[];
	limits: RateLimit[];
	apiKeys: APIKey[];
	npmPackages: NPMPackage[];
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface Param {
	name: string;
	value: string;
	createdBy: string;
	updatedBy?: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export interface NPMPackage {
	name: string;
	version: string;
	description: string;
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
}
export type NotificationActions = 'create' | 'update' | 'delete' | 'deploy' | 'redeploy';
export interface Notification {
	_id: string;
	object: string;
	orgId: string;
	appId: string;
	versionId: string;
	dbId?: string;
	modelId?: string;
	fieldId?: string;
	resourceId?: string;
	envId?: string;
	endpointId?: string;
	middlewareId?: string;
	queueId?: string;
	taskId?: string;
	storageId?: string;
	action: NotificationActions;
	actor: Partial<User>;
	description: string;
	data: any;
	createdAt: string;
	__v: number;
}

export interface GetVersionNotificationParams extends BaseGetRequest {
	orgId: string;
	appId: string;
	versionId: string;
	actor?: string[];
	action?: NotificationActions[];
}

export interface GetVersionRequest extends BaseGetRequest {
	name?: string;
	appId: string;
}

export type TabTypes =
	| 'Database'
	| 'Storage'
	| 'Cache'
	| 'Message Queue'
	| 'Task'
	| 'Endpoint'
	| 'Middleware'
	| 'Settings'
	| 'Dashboard'
	| 'Notifications'
	| 'Queue';

export type DesignElementTypes = Lowercase<TabTypes>;
export interface Tab {
	id: string;
	title: string;
	path: string;
	isActive: boolean;
	isDashboard: boolean;
	isDirty?: boolean;
	type: TabTypes;
}

export interface DesignElement {
	_id: string;
	versionId: string;
	name: string;
	type: DesignElementTypes;
	meta: {
		method: HttpMethod;
		path: string;
	};
}

export interface VersionParams {
	orgId: string;
	appId: string;
	versionId: string;
	envId: string;
}

export type GetVersionByIdParams = BaseParams;
export type DeleteVersionParams = BaseParams;
export type CreateRateLimitParams = BaseParams & {
	rate: number;
	duration: number;
	name: string;
	errorMessage: string;
};
export type DeleteRateLimitParams = BaseParams & {
	limitId: string;
};

export type DeleteMultipleRateLimitsParams = BaseParams & {
	limitIds: string[];
};

export type VersionProperties = {
	name: string;
	private: boolean;
	readOnly: boolean;
	defaultEndpointLimits: string[];
};

export type VersionRealtimeProperties = {
	enabled: boolean;
	apiKeyRequired: boolean;
	sessionRequired: boolean;
	rateLimits: string[];
};

export type UpdateVersionPropertiesParams = BaseParams & VersionProperties;
export type UpdateVersionRealtimePropertiesParams = BaseParams & VersionRealtimeProperties;

export type SearchNPMPackagesParams = BaseParams & {
	page: number;
	size: number;
	package: string;
	sortBy?: string;
};

export type AddNPMPackageParams = BaseParams & {
	name: string;
	version: string;
	description: string;
};

export type DeleteNPMPackageParams = BaseParams & {
	packageId: string;
};

export type DeleteMultipleNPMPackagesParams = BaseParams & {
	packageIds: string[];
};

export type DeleteVersionVariableParams = BaseParams & {
	paramId: string;
};

export type DeleteMultipleVersionVariablesParams = BaseParams & {
	paramIds: string[];
};

export type AddVersionVariableParams = BaseParams & {
	name: string;
	value: string;
};

export type UpdateVersionVariableParams = AddVersionVariableParams & {
	paramId: string;
};

export type CreateCopyOfVersionParams = Omit<BaseParams, 'versionId'> & {
	name: string;
	private: boolean;
	readOnly: boolean;
	parentVersionId: string;
};

export type EditRateLimitParams = CreateRateLimitParams & {
	limitId: string;
};

export type CreateAPIKeyParams = BaseParams & {
	name: string;
	allowRealtime: boolean;
	type: APIKeyTypes;
	domainAuthorization: AllAndSpecified;
	IPAuthorization: AllAndSpecified;
	expiryDate?: Date;
	excludedEndpoints?: string[];
	allowedEndpoints?: string[];
	authorizedDomains?: string[];
	authorizedIPs?: string[];
};

export type UpdateAPIKeyParams = BaseParams &
	CreateAPIKeyParams & {
		keyId: string;
	};
export type DeleteAPIKeyParams = BaseParams & {
	keyId: string;
};
export type DeleteMultipleAPIKeys = BaseParams & {
	keyIds: string[];
};
export type SearchDesignElementParams = BaseParams & {
	keyword: string;
};
