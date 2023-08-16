import { translate } from '@/utils';
import { z } from 'zod';
import { EnvLog, Environment } from './environment';
import { ResLog, Resource } from './resource';
import { BaseRequest } from './type';
import { Version } from './version';

export type AppRoles = 'Admin' | 'Developer' | 'Viewer';
export interface Application {
	_id: string;
	orgId: string;
	iid: string;
	ownerUserId: string;
	name: string;
	color: string;
	team: Team[];
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	pictureUrl: string;
	role: AppRoles;
}

export interface Team {
	userId: {
		_id: string;
		name: string;
		color: string;
		pictureUrl: string;
	};
	role: string;
	_id: string;
	joinDate: string;
}

export interface CreateApplicationRequest extends BaseRequest {
	name: string;
	orgId: string;
}
export const CreateApplicationSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', { label: translate('application.name') }),
		})
		.min(2, {
			message: translate('forms.min2.error', { label: translate('application.name') }),
		})
		.max(64, {
			message: translate('forms.max64.error', { label: translate('application.name') }),
		})
		.regex(/^[a-zA-Z0-9 ]*$/, {
			message: translate('forms.alphanumeric', { label: translate('application.name') }),
		}),
});

export interface CreateApplicationResponse {
	app: Application;
	env: Environment;
	envLog: EnvLog;
	resLog: ResLog;
	version: Version;
	resource: Resource;
}
export interface DeleteApplicationRequest extends BaseRequest {
	appId: string;
	orgId: string;
}
export interface ChangeAppNameRequest extends BaseRequest {
	name: string;
}
export interface SetAppAvatarRequest extends BaseRequest {
	picture: File;
	appId: string;
}
export interface TransferAppOwnershipRequest extends BaseRequest {
	userId: string;
}
export interface ApplicationMember {
	_id: string;
	appId: string;
	role: string;
	joinDate: string;
	member: {
		color: string;
		contactEmail: string;
		iid: string;
		isAppOwner: boolean;
		loginEmail: string;
		name: string;
		_id: string;
		pictureUrl: string;
	};
}
export interface TeamOption {
	readonly value: ApplicationMember;
	readonly label: string;
}
interface AppMemberRequest {
	email: string;
	role: AppRoles | '';
}
export interface AppInviteRequest extends BaseRequest {
	members: AppMemberRequest[];
	uiBaseUrl: string;
}

interface AuthPermissions {
	update: boolean;
}

interface PackagePermissions extends AuthPermissions {
	create: boolean;
	update: boolean;
	delete: boolean;
}

interface KeyPermissions extends AuthPermissions {
	create: boolean;
	update: boolean;
	delete: boolean;
}

interface LimitPermissions extends AuthPermissions {
	create: boolean;
	update: boolean;
	delete: boolean;
}

interface ParamPermissions extends AuthPermissions {
	create: boolean;
	update: boolean;
	delete: boolean;
}

export interface AppRoleDefinition {
	view: boolean;
	update: boolean;
	delete: boolean;
	transfer: boolean;
	viewLogs: boolean;
	invite: {
		view: boolean;
		create: boolean;
		update: boolean;
		resend: boolean;
		delete: boolean;
	};
	team: {
		view: boolean;
		update: boolean;
		delete: boolean;
	};
	version: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
		param: ParamPermissions;
		limit: LimitPermissions;
		key: KeyPermissions;
		package: PackagePermissions;
		auth: AuthPermissions;
	};
	db: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	model: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	resource: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	env: {
		view: boolean;
		update: boolean;
		deploy: boolean;
	};
	endpoint: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	middleware: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	queue: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	task: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
	storage: {
		view: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
	};
}

export interface AppRolePermissions {
	app: AppRoleDefinition;
}

export interface AppPermissions {
	Admin: AppRolePermissions;
	Developer: AppRolePermissions;
	Viewer: AppRolePermissions;
}
