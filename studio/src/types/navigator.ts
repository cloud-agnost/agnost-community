import { Cell, Row } from '@tanstack/react-table';
import { BaseGetRequest, BaseRequest, Field } from '.';

export type GetDataFromModelParams = BaseGetRequest & {
	id?: string;
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
	row?: Row<any>;
	cell: Cell<any, any>;
};
