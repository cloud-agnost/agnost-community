import { GetDatabasesOfAppParams } from '@/types/database.ts';

export interface Model {
	orgId: string;
	appId: string;
	versionId: string;
	dbId: string;
	iid: string;
	name: string;
	type: string;
	description: string;
	timestamps: {
		enabled: boolean;
		createdAt: string;
		updatedAt: string;
	};
	fields: Field[];
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export interface Field {
	name: string;
	iid: string;
	creator: string;
	type: string;
	dbType: string;
	order: boolean;
	required: boolean;
	unique: boolean;
	immutable: boolean;
	indexed: boolean;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export type GetModelsOfDatabaseParams = GetDatabasesOfAppParams & {
	dbId: string;
};

export type CreateModelParams = GetModelsOfDatabaseParams & {
	name: string;
	description?: string;
	timestamps: {
		enabled: boolean;
		createdAt?: string;
		updatedAt?: string;
	};
};

export type UpdateNameAndDescriptionParams = GetModelsOfDatabaseParams & {
	modelId: string;
	name: string;
	description: string;
};

export type AddNewFieldParams = GetModelsOfDatabaseParams & {
	type: string;
	modelId: string;
	name: string;
	description?: string;
	required: boolean;
	unique: boolean;
	immutable: boolean;
	indexed: boolean;
	defaultValue?: string;
	text?: {
		searchable: boolean;
		maxLength: number;
	};
	richText?: {
		searchable: boolean;
		maxLength: number;
	};
	encryptedText?: {
		maxLength: number;
	};
	decimal?: {
		decimalDigits: number;
	};
	enum?: {
		selectList: string[];
	};
	object?: {
		timestamps: {
			enabled: boolean;
			createdAt: string;
			updatedAt: string;
		};
	};
	objectList?: {
		timestamps: {
			enabled: boolean;
			createdAt: string;
			updatedAt: string;
		};
	};
	reference?: {
		iid: string;
		action: ReferenceAction;
	};
};

export type ReferenceAction = 'CASCADE' | 'NO ACTION' | 'SET NULL' | 'SET DEFAULT';
