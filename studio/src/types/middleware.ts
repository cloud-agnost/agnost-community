import { BaseGetRequest, BaseParams, BaseRequest, Middleware } from '@/types';

export type GetMiddlewaresOfAppVersionParams = BaseParams & BaseGetRequest;

export type GetMiddlewareByIdParams = BaseParams & {
	mwId: string;
};

export type DeleteMiddlewareParams = GetMiddlewareByIdParams & BaseRequest;
export type DeleteMultipleMiddlewares = BaseParams &
	BaseRequest & {
		middlewareIds: string[];
	};

export type CreateMiddlewareParams = BaseParams &
	BaseRequest & {
		name: string;
	};

export type UpdateMiddlewareParams = GetMiddlewareByIdParams & Partial<Middleware> & BaseRequest;
export type SaveMiddlewareCodeParams = GetMiddlewareByIdParams &
	BaseRequest & {
		logic: string;
	};
