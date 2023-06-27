import { BaseGetRequest } from './type';

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
	defaultEndpointLimits: [];
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
	_id: string;
	params: [];
	limits: [];
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
