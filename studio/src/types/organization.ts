import { APIError } from '@/types';

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
export interface CreateOrganizationRequest {
	name: string;
	onSuccess: () => void;
	onError: (err: APIError) => void;
}
