import { z } from 'zod';
import { BaseRequest } from './type';
import { translate } from '@/utils';
export interface Organization {
	_id: string;
	ownerUserId: string;
	iid: string;
	name: string;
	color: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	pictureUrl: string;
	updatedBy: string;
	__v: number;
	role: 'Admin' | 'Member' | 'Resource Manager' | 'Viewer';
}
export interface CreateOrganizationRequest extends BaseRequest {
	name: string;
}
export interface LeaveOrganizationRequest extends BaseRequest {
	organizationId: string;
}

export const CreateOrganizationSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', { label: translate('organization.name') }),
		})
		.min(2, {
			message: translate('forms.min2.error', { label: translate('organization.name') }),
		})
		.max(64, {
			message: translate('forms.max64.error', { label: translate('organization.name') }),
		})
		.regex(/^[a-zA-Z0-9 ]*$/, {
			message: translate('forms.alphanumeric', { label: translate('organization.name') }),
		}),
});
