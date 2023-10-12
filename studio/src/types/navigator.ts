import { Row } from '@tanstack/react-table';
import { BaseRequest, Field } from '.';

export type GetDataFromModelParams = {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
	search?: string;
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
	isEditable?: boolean;
	field: Field;
	parentId?: string;
	row?: Row<any>;
};
