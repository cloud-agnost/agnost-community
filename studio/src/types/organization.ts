import { translate } from '@/utils';
import { z } from 'zod';
import { BaseGetRequest, BaseRequest } from './type';
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
export interface ChangeOrganizationNameRequest extends BaseRequest {
	name: string;
	organizationId: string;
}

export interface ChangeOrganizationAvatarRequest extends BaseRequest {
	organizationId: string;
	picture: File;
}

export interface GetOrganizationMembersRequest extends BaseGetRequest {
	role?: string;
	organizationId: string;
	excludeSelf?: boolean;
}

export interface TransferOrganizationRequest extends BaseRequest {
	organizationId: string;
	userId: string;
}
export interface OrganizationMember {
	_id: string;
	orgId: string;
	role: string;
	joinDate: string;
	member: {
		_id: string;
		iid: string;
		color: string;
		contactEmail: string;
		name: string;
		pictureUrl: string;
		loginEmail: string;
		isOrgOwner: boolean;
	};
}
export interface OrgMemberRequest {
	email: string;
	role: 'Admin' | 'Member' | 'Resource Manager' | 'Viewer' | '';
}
export interface InviteOrgRequest extends BaseRequest {
	members: OrgMemberRequest[];
	organizationId: string;
	uiBaseURL: string;
}

export interface RemoveMemberFromOrganizationRequest extends BaseRequest {
	userId?: string;
	userIds?: string[];
}
