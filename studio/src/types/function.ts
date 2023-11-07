import * as z from 'zod';
import { BaseGetRequest, BaseParams, BaseRequest } from '.';
import { NameSchema } from './schema';

export interface HelperFunction {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	type: 'code' | 'flow';
	logic: string;
	createdBy: string;
	updatedBy?: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export type GetFunctionsOfAppVersion = BaseParams & BaseGetRequest;
export type GetFunctionByIdParams = BaseParams & {
	funcId: string;
};
export interface DeleteMultipleFunctions extends BaseParams, BaseRequest {
	functionIds: string[];
}
export type DeleteFunctionParams = GetFunctionByIdParams & BaseRequest;
export interface CreateFunctionParams extends BaseParams, BaseRequest {
	name: string;
}
export type UpdateFunctionParams = GetFunctionByIdParams & Partial<HelperFunction> & BaseRequest;
export interface SaveFunctionCodeParams extends GetFunctionByIdParams, BaseRequest {
	logic: string;
}
export const CreateFunctionSchema = z.object({
	name: NameSchema,
});
