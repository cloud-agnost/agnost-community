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
	parentiid?: string;
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
	creator: 'system' | 'user';
	type: string;
	description: string;
	defaultValue: string;
	dbType: string;
	order: number;
	required: boolean;
	unique: boolean;
	immutable: boolean;
	indexed: boolean;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	text?: {
		searchable: boolean;
		maxLength: number;
	};
	richText?: {
		searchable: boolean;
	};
	encryptedText?: {
		maxLength: number;
	};
	decimal?: {
		decimalDigits: number;
	};
	object?: {
		iid: string;
		timestamps: {
			enabled: boolean;
			createdAt: string;
			updatedAt: string;
		};
	};
	objectList?: {
		iid: string;
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
	enum?: {
		selectList: string[];
	};
}

export type GetModelsOfDatabaseParams = Omit<GetDatabasesOfAppParams, 'modelId'> & {
	dbId: string;
};
export type GetSpecificModelByIidOfDatabase = GetModelsOfDatabaseParams & {
	modelIid: string;
};
export type GetSpecificModelOfDatabase = GetModelsOfDatabaseParams & {
	modelId: string;
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

export type DeleteModelParams = GetModelsOfDatabaseParams & {
	modelId: string;
};

export type DeleteMultipleModelParams = GetModelsOfDatabaseParams & {
	modelIds: string[];
};

export type UpdateNameAndDescriptionParams = GetModelsOfDatabaseParams & {
	modelId: string;
	name: string;
	description?: string;
};
export type DeleteFieldParams = GetModelsOfDatabaseParams & {
	modelId: string;
	fieldId: string;
};
export type DeleteMultipleFieldParams = GetModelsOfDatabaseParams & {
	modelId: string;
	fieldIds: string[];
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
	basicValuesList?: {
		type: BasicValueListType;
	};
};

export type UpdateFieldParams = AddNewFieldParams & {
	fieldId: string;
};

export type BasicValueListType =
	| 'text'
	| 'integer'
	| 'decimal'
	| 'monetary'
	| 'datetime'
	| 'date'
	| 'time'
	| 'email'
	| 'link'
	| 'phone'
	| 'id';

export type ReferenceAction = 'CASCADE' | 'NO ACTION' | 'SET NULL' | 'SET DEFAULT';
