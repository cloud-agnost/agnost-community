import { Cell } from '@tanstack/react-table';
import { DatabaseTypes } from '.';
import { Field } from './model';
import { BaseGetRequest, BaseRequest } from './type';

export type GetDataFromModelParams = BaseGetRequest & {
	id?: string;
	dbType: DatabaseTypes;
};

export interface DeleteDataFromModelParams extends BaseRequest {
	id: string;
}
export interface DeleteMultipleDataFromModelParams extends BaseRequest {
	ids: string[];
}
export interface UpdateDataFromModelParams extends BaseRequest {
	id: string;
	isSubObjectUpdate?: boolean;
	data: any;
}
export type NavigatorComponentProps = {
	field: Field;
	parentId?: string;
	cell: Cell<any, any>;
	value: any;
	id: string | number;
	index: number;
};
