import { BaseParams, Middleware } from '@/types';

export type GetMiddlewaresOfAppVersionParams = BaseParams & {
	page: number;
	size: number;
	search?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
	start?: number;
	end?: number;
};

export type GetMiddlewareByIdParams = BaseParams & {
	mwId: string;
};

export type DeleteMiddlewareParams = GetMiddlewareByIdParams;
export type DeleteMultipleMiddlewares = BaseParams & {
	middlewareIds: string[];
};

export type CreateMiddlewareParams = BaseParams & {
	name: string;
};

export type UpdateMiddlewareParams = GetMiddlewareByIdParams & Partial<Middleware>;
export type SaveMiddlewareCodeParams = GetMiddlewareByIdParams & {
	logic: string;
};
