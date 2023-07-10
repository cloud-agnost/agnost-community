import { VersionParamsWithoutEnvId } from '@/types/version.ts';
import { Middleware } from '@/types/type.ts';

export type GetMiddlewaresOfAppVersionParams = VersionParamsWithoutEnvId & {
	page: number;
	size: number;
	search?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
	start?: number;
	end?: number;
};

export type GetMiddlewareByIdParams = VersionParamsWithoutEnvId & {
	mwId: string;
};

export type DeleteMiddlewareParams = GetMiddlewareByIdParams;
export type DeleteMultipleMiddlewares = VersionParamsWithoutEnvId & {
	middlewareIds: string[];
};

export type CreateMiddlewareParams = VersionParamsWithoutEnvId & {
	name: string;
};

export type UpdateMiddlewareParams = GetMiddlewareByIdParams & Partial<Middleware>;
export type SaveMiddlewareCodeParams = GetMiddlewareByIdParams & {
	logic: string;
};
