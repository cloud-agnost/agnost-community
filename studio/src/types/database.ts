import { VersionParams } from '@/types/version.ts';

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

export type DeleteDatabaseParams = GetDatabaseOfAppByIdParams;

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
