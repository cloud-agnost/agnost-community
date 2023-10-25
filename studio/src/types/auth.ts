import { BaseRequest } from '.';

export type LoginParams = BaseRequest & {
	email: string;
	password: string;
};

export type LogoutParams = BaseRequest;
