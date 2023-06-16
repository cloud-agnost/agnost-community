import { APIError } from '@/types';
import { BaseRequest } from './type';

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
