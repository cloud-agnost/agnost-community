import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

export const UserSchema = z.object({
	iid: z.string(),
	name: z.string(),
	color: z.string(),
	contactEmail: z.string(),
	'2fa': z.boolean(),
	pictureUrl: z.string().nullish(),
	canCreateOrg: z.boolean(),
	isClusterOwner: z.boolean(),
	loginProfiles: z.array(
		z.object({
			provider: z.string(),
			id: z.string(),
			email: z.string(),
			emailVerified: z.boolean(),
			_id: z.string(),
		}),
	),
	notifications: z.array(z.string()),
	status: z.string(),
	_id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	__v: z.number(),
	at: z.string(),
	rt: z.string(),
});

export type APIError = {
	error: string;
	details: string;
	code: string;
	fields?: {
		value: string;
		msg: string;
		param: string;
		location: string;
	}[];
};
export type User = z.infer<typeof UserSchema>;

export interface UserDataToRegister {
	name: string;
	email: string;
	password: string;
}

export interface OnboardingData {
	orgName: string;
	appName: string;
	uiBaseURL: string;
	smtp: SMTPSettings;
	appMembers: AppMembers[];
}

export interface SMTPSettings {
	host: string;
	port: string;
	useTLS: boolean;
	user: string;
	password: string;
}

export interface AppMembers {
	email?: string;
	role?: 'Admin' | 'Developer' | 'Viewer' | '';
}

export interface CompleteAccountSetupRequest {
	email: string | undefined;
	token: string;
	inviteType: 'org' | 'app';
	name: string;
	password: string;
}

export interface FinalizeAccountSetupRequest {
	email: string | undefined;
	verificationCode: number;
	password: string;
	name: string;
}
export interface BaseRequest {
	onSuccess?: () => void;
	onError?: (err: APIError) => void;
}

export interface ToastType {
	title: string;
	description: string;
	type: 'success' | 'error';
}

export interface UpdateNotificationData {
	notifications: string[];
}

export interface Types {
	orgRoles: string[];
	appRoles: string[];
	bvlTypes: string[];
	fieldTypes: {
		name: string;
		PostgreSQL: boolean;
		MySQL: boolean;
		'SQL Server': boolean;
		MongoDB: boolean;
		view: {
			unique: boolean;
			indexed: boolean;
			immutable: boolean;
		};
	}[];
	databaseTypes: string[];
	instanceTypes: {
		engine: string[];
		database: string[];
		cache: string[];
		storage: string[];
		queue: string[];
		scheduler: string[];
		realtime: string[];
	};
	phoneAuthSMSProviders: [
		{
			provider: string;
			params: {
				name: string;
				title: string;
				type: string;
				description: string;
				multiline: boolean;
			}[];
		}[],
	];
	oAuthProviderTypes: [
		{
			provider: string;
			params: {
				name: string;
				title: string;
				type: string;
				multiline: boolean;
			}[];
		}[],
	];
	authUserDataModel: {
		name: string;
		type: string;
	}[];
}
export interface BaseGetRequest extends BaseRequest {
	initialFetch: boolean;
	page: number;
	size: number;
	sortBy?: string;
	sortDir?: string;
	start?: string;
	end?: string;
	search?: string;
	initialFetch?: boolean;
}

export interface SortOption {
	name: string;
	value?: string;
	sortDir?: 'asc' | 'desc' | '';
}
export interface FormatOptionLabelProps {
	label: string;
	value: any;
}
export interface GroupedOption<T> {
	readonly label: string;
	readonly options: readonly T[];
}

export interface Invitation {
	_id: string;
	orgId: string;
	email: string;
	token: string;
	role: string;
	status: 'Pending' | 'Active';
	createdAt: string;
}

export interface GetInvitationRequest extends BaseGetRequest {
	email?: string;
	roles: string[];
	status?: string;
}
export interface InvitationRequest extends BaseRequest {
	token?: string;
	tokens?: string[];
}
export interface UpdateRoleRequest extends BaseRequest {
	token?: string;
	userId?: string;
	role: string;
}
export interface RemoveMemberRequest extends BaseRequest {
	userId?: string;
	userIds?: string[];
}
export type RealtimeActionTypes = 'update' | 'create' | 'delete';
export type RealtimeObjectTypes = 'user' | 'organization';
export interface RealtimeIdentifiers {
	orgId?: string;
	appId?: string;
	userId?: string;
	versionId?: string;
	resourceId?: string;
	envId?: string;
}
export interface RealtimeData<T> {
	actor: Partial<User>;
	action: RealtimeActionTypes;
	object: RealtimeObjectTypes;
	description: string;
	timestamp: number;
	data: T;
	identifiers: RealtimeIdentifiers;
}
export interface RealtimeActionParams<T> {
	data: T;
	identifiers: RealtimeIdentifiers;
}

export interface Middleware {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	type: string;
	logic: string;
	createdBy: string;
	updatedBy?: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface SearchNPMPackages {
	package: string;
	version: string;
	description: string;
}

export type ColumnDefWithClassName<TData> = ColumnDef<TData> & {
	className?: string;
};
