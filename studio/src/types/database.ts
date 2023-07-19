import { VersionParams } from '@/types/version.ts';

export interface Database {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	type: string;
	managed: boolean;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export type GetDatabasesOfAppParams = Omit<VersionParams, 'envId'>;

export type CreateDatabaseParams = GetDatabasesOfAppParams & {
	name: string;
	type: string;
	managed: boolean;
	resourceId: string;
};

export type GetDatabaseOfAppByIdParams = GetDatabasesOfAppParams & {
	dbId: string;
};

export type DeleteDatabaseParams = GetDatabasesOfAppParams & {
	dbId: string;
};

export type UpdateDatabaseNameParams = GetDatabaseOfAppByIdParams & {
	name: string;
};

export interface PaginationOptions {
	page?: number;
	size?: number;
	sort?: string;
	sortDir?: string;
	start?: string;
	end?: string;
}
