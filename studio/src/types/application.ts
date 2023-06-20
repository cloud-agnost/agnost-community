import { z } from 'zod';
import { BaseRequest } from './type';
import { translate } from '@/utils';
import { Environment, EnvLog } from './environment';
import { Version } from './version';
import { Resource, ResLog } from './resource';

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
