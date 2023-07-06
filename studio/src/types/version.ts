import { BaseGetRequest, User } from './type';

export interface RateLimit {
	_id: string;
	iid: string;
	createdBy: string | User;
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
	realtime: {
		enabled: boolean;
		apiKeyRequired: boolean;
		sessionRequired: boolean;
		rateLimits: [];
	};
	defaultEndpointLimits: RateLimit[];
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
	createdBy: string | User;
	_id: string;
	params: [];
	limits: RateLimit[];
	apiKeys: [];
	npmPackages: [];
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface GetVersionRequest extends BaseGetRequest {
	name?: string;
	appId: string;
}

export interface Tab {
	id: string;
	title: string;
	path: string;
}

export interface VersionParams {
	orgId: string;
	appId: string;
	versionId: string;
	envId: string;
}

export type VersionParamsWithoutEnvId = Omit<VersionParams, 'envId'>;
export type GetVersionByIdParams = VersionParamsWithoutEnvId;
export type CreateRateLimitParams = VersionParamsWithoutEnvId & {
	rate: number;
	duration: number;
	name: string;
	errorMessage: string;
};
export type DeleteRateLimitParams = VersionParamsWithoutEnvId & {
	limitId: string;
};
export type VersionProperties = {
	name: string;
	private: boolean;
	readOnly: boolean;
	defaultEndpointLimits: RateLimit[];
};

export type UpdateVersionPropertiesParams = VersionParamsWithoutEnvId & VersionProperties;
