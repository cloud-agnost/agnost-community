import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ModelService } from '@/services';
import {
	AddNewFieldParams,
	APIError,
	CreateModelParams,
	DeleteFieldParams,
	DeleteModelParams,
	DeleteMultipleFieldParams,
	DeleteMultipleModelParams,
	Field,
	GetModelsOfDatabaseParams,
	GetSpecificModelOfDatabaseParams,
	Model,
	UpdateFieldParams,
	UpdateNameAndDescriptionParams,
} from '@/types';
import { notify } from '@/utils';

interface ModelStore {
	models: Model[];
	subModel: Model | null;
	modelToEdit: Model | null;
	fieldToEdit: Field | null;
	isOpenEditModelDialog: boolean;
	isOpenEditFieldDialog: boolean;
	setFieldToEdit: (field: Field | null) => void;
	setIsOpenEditFieldDialog: (isOpen: boolean) => void;
	setModelToEdit: (model: Model | null) => void;
	setIsOpenEditModelDialog: (isOpen: boolean) => void;
	getModelsOfDatabase: (params: GetModelsOfDatabaseParams) => Promise<Model[]>;
	getSpecificModelByIidOfDatabase: (params: GetSpecificModelOfDatabaseParams) => Promise<Model>;
	createModel: (params: CreateModelParams) => Promise<Model>;
	deleteModel: (params: DeleteModelParams) => Promise<void>;
	deleteMultipleModel: (params: DeleteMultipleModelParams) => Promise<void>;
	updateNameAndDescription: (params: UpdateNameAndDescriptionParams) => Promise<Model>;
	addNewField: (params: AddNewFieldParams, isSubModel?: boolean) => Promise<Model>;
	deleteField: (params: DeleteFieldParams, isSubModel?: boolean) => Promise<Model>;
	deleteMultipleField: (params: DeleteMultipleFieldParams) => Promise<Model>;
	updateField: (params: UpdateFieldParams, isSubModel?: boolean) => Promise<Model>;
	getReferenceModels: (params: GetModelsOfDatabaseParams) => Promise<Model[]>;
}

const useModelStore = create<ModelStore>()(
	devtools(
		persist(
			(set) => ({
				models: [],
				subModel: null,
				modelToEdit: null,
				fieldToEdit: null,
				isOpenEditModelDialog: false,
				isOpenEditFieldDialog: false,
				setFieldToEdit: (field: Field | null) => {
					set({ fieldToEdit: field });
				},
				setIsOpenEditFieldDialog: (isOpen: boolean) => {
					if (!isOpen) {
						set({ fieldToEdit: null });
					}
					set({ isOpenEditFieldDialog: isOpen });
				},
				setModelToEdit: (model: Model | null) => {
					set({ modelToEdit: model });
				},
				setIsOpenEditModelDialog: (isOpen: boolean) => {
					if (!isOpen) {
						set({ modelToEdit: null });
					}
					set({ isOpenEditModelDialog: isOpen });
				},
				getModelsOfDatabase: async (params: GetModelsOfDatabaseParams): Promise<Model[]> => {
					const models = await ModelService.getModelsOfDatabase(params);
					set({ models });
					return models;
				},
				getSpecificModelByIidOfDatabase: async (
					params: GetSpecificModelOfDatabaseParams,
				): Promise<Model> => {
					try {
						const subModel = await ModelService.getSpecificModelByIidOfDatabase(params);
						set({ subModel });
						return subModel;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				createModel: async (params: CreateModelParams): Promise<Model> => {
					try {
						const model = await ModelService.createModel(params);
						set((state) => ({ models: [model, ...state.models] }));
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				updateNameAndDescription: async (
					params: UpdateNameAndDescriptionParams,
				): Promise<Model> => {
					try {
						const model = await ModelService.updateNameAndDescription(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
						}));
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				addNewField: async (params: AddNewFieldParams, isSubModel): Promise<Model> => {
					try {
						const model = await ModelService.addNewField(params);
						if (isSubModel) {
							set({ subModel: model });
						} else {
							set((state) => ({
								models: state.models.map((m) => (m._id === model._id ? model : m)),
							}));
						}
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteField: async (params: DeleteFieldParams, isSubModel): Promise<Model> => {
					try {
						const model = await ModelService.deleteField(params);
						if (isSubModel) {
							set({ subModel: model });
						} else {
							set((state) => ({
								models: state.models.map((m) => (m._id === model._id ? model : m)),
							}));
						}
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteMultipleField: async (params: DeleteMultipleFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.deleteMultipleField(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
						}));
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteModel: async (params: DeleteModelParams): Promise<void> => {
					try {
						await ModelService.deleteModel(params);
						set((state) => ({
							models: state.models.filter((m) => m._id !== params.modelId),
						}));
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteMultipleModel: async (params: DeleteMultipleModelParams): Promise<void> => {
					try {
						await ModelService.deleteMultipleModel(params);
						set((state) => ({
							models: state.models.filter((m) => !params.modelIds.includes(m._id)),
						}));
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				updateField: async (params: UpdateFieldParams, isSubModel): Promise<Model> => {
					try {
						const model = await ModelService.updateField(params);
						if (isSubModel) {
							set({ subModel: model });
						} else {
							set((state) => ({
								models: state.models.map((m) => (m._id === model._id ? model : m)),
							}));
						}
						return model;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				getReferenceModels: async (params: GetModelsOfDatabaseParams): Promise<Model[]> => {
					try {
						return ModelService.getReferenceModels(params);
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
			}),
			{
				name: 'model-storage',
			},
		),
		{
			name: 'database',
		},
	),
);

export default useModelStore;
