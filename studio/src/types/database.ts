import { VersionParams } from '@/types/version.ts';

export interface Database {
	orgId: string;
	appId: string;
	assignUniqueName: boolean;
	poolSize: number;
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
	poolSize: number;
	managed: boolean;
	resourceId: string;
	assignUniqueName: boolean;
};

export type GetDatabaseOfAppByIdParams = GetDatabasesOfAppParams & {
	dbId: string;
};

export type DeleteDatabaseParams = GetDatabasesOfAppParams & {
	dbId: string;
};

export type UpdateDatabaseParams = GetDatabaseOfAppByIdParams & {
	name: string;
	poolSize: number;
};
