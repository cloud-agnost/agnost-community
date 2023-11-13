import { BaseParams, BaseRequest, Middleware } from '@/types';
import { z } from 'zod';
import { NameSchema } from './schema';

export type GetMiddlewareByIdParams = BaseParams & {
	mwId: string;
};

export type DeleteMiddlewareParams = GetMiddlewareByIdParams & BaseRequest;
export type DeleteMultipleMiddlewares = BaseParams & {
	middlewareIds: string[];
};

export type CreateMiddlewareParams = BaseParams &
	BaseRequest & {
		name: string;
	};

export type UpdateMiddlewareParams = GetMiddlewareByIdParams & Partial<Middleware>;
export type SaveMiddlewareCodeParams = GetMiddlewareByIdParams &
	BaseRequest & {
		logic: string;
	};

export const MiddlewareSchema = z.object({
	name: NameSchema,
});
