import { create } from '@/helpers';
import { CustomStateStorage } from '@/helpers/state';
import { ModelService } from '@/services';
import {
	APIError,
	AddNewFieldParams,
	CreateModelParams,
	DeleteFieldParams,
	DeleteModelParams,
	DeleteMultipleFieldParams,
	DeleteMultipleModelParams,
	DisableTimestampsParams,
	EnableTimestampsParams,
	Field,
	GetModelsOfDatabaseParams,
	GetSpecificModelByIidOfDatabase,
	GetSpecificModelOfDatabase,
	Model,
	UpdateFieldParams,
	UpdateNameAndDescriptionParams,
} from '@/types';
import { notify } from '@/utils';
import { devtools, persist } from 'zustand/middleware';

interface ModelStore {
	models: Model[];
	model: Model;
	subModel: Model;
	nestedModels: {
		name: string;
		index: number;
	}[];
	modelToEdit: Model | null;
	fieldToEdit: Field | null;
	isOpenEditModelDialog: boolean;
	isOpenEditFieldDialog: boolean;
}

type Actions = {
	setFieldToEdit: (field: Field) => void;
	setIsOpenEditFieldDialog: (isOpen: boolean) => void;
	setModelToEdit: (model: Model) => void;
	setIsOpenEditModelDialog: (isOpen: boolean) => void;
	getModelsOfDatabase: (params: GetModelsOfDatabaseParams) => Promise<Model[]>;
	getSpecificModelByIidOfDatabase: (params: GetSpecificModelByIidOfDatabase) => Promise<Model>;
	getSpecificModelOfDatabase: (params: GetSpecificModelOfDatabase) => Promise<Model>;
	createModel: (params: CreateModelParams) => Promise<Model>;
	deleteModel: (params: DeleteModelParams) => Promise<void>;
	deleteMultipleModel: (params: DeleteMultipleModelParams) => Promise<void>;
	updateNameAndDescription: (params: UpdateNameAndDescriptionParams) => Promise<Model>;
	addNewField: (params: AddNewFieldParams) => Promise<Model>;
	deleteField: (params: DeleteFieldParams) => Promise<Model>;
	deleteMultipleField: (params: DeleteMultipleFieldParams) => Promise<Model>;
	updateField: (params: UpdateFieldParams) => Promise<Model>;
	getReferenceModels: (params: GetModelsOfDatabaseParams) => Promise<Model[]>;
	enableTimestamps: (params: EnableTimestampsParams) => Promise<Model>;
	disableTimestamps: (params: DisableTimestampsParams) => Promise<Model>;
	setModel: (model: Model) => void;
	setNestedModels: (modelName: string, index: number) => void;
	resetNestedModels: () => void;
	getModelsTitle: () => string;
	reset: () => void;
};

const initialState: ModelStore = {
	models: [],
	model: {} as Model,
	subModel: {} as Model,
	nestedModels: [],
	modelToEdit: null,
	fieldToEdit: {} as Field,
	isOpenEditModelDialog: false,
	isOpenEditFieldDialog: false,
};

const useModelStore = create<ModelStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				setFieldToEdit: (field: Field) => {
					set({ fieldToEdit: field });
				},
				setIsOpenEditFieldDialog: (isOpen: boolean) => {
					if (!isOpen) {
						set({ fieldToEdit: null });
					}
					set({ isOpenEditFieldDialog: isOpen });
				},
				setModelToEdit: (model: Model) => {
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
					set({ models, model: models[0] });
					return models;
				},
				getSpecificModelByIidOfDatabase: async (
					params: GetSpecificModelByIidOfDatabase,
				): Promise<Model> => {
					try {
						const subModel = await ModelService.getSpecificModelByIidOfDatabase(params);
						set({ subModel });
						if (params.onSuccess) params.onSuccess(subModel);
						return subModel;
					} catch (e) {
						const error = e as APIError;
						if (params.onError) params.onError(error);
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				getSpecificModelOfDatabase: async (params: GetSpecificModelOfDatabase): Promise<Model> => {
					try {
						const model = await ModelService.getSpecificModelOfDatabase(params);
						set((state) => {
							if (state.models.some((m) => m._id === model._id)) {
								return {
									models: state.models.map((m) => (m._id === model._id ? model : m)),
								};
							}
							return {
								models: [model, ...state.models],
							};
						});
						return model;
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
				addNewField: async (params: AddNewFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.addNewField(params);
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
				deleteField: async (params: DeleteFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.deleteField(params);
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
				updateField: async (params: UpdateFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.updateField(params);
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
				enableTimestamps: async (params: EnableTimestampsParams): Promise<Model> => {
					try {
						const model = await ModelService.enableTimestamps(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
						}));
						return model;
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
				disableTimestamps: async (params: DisableTimestampsParams): Promise<Model> => {
					try {
						const model = await ModelService.disableTimestamps(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
						}));
						return model;
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
				setModel: (model: Model) => {
					set({ subModel: {} as Model, model });
				},
				setNestedModels: (modelName: string, index: number) => {
					set((state) => ({
						nestedModels: [
							...state.nestedModels,
							{
								name: modelName,
								index,
							},
						],
					}));
				},
				resetNestedModels: () => {
					set({ nestedModels: [] });
				},
				getModelsTitle: () => {
					return get().model
						? `${get().model.name}${
								get().nestedModels.length
									? '.' +
									  get()
											.nestedModels.map((m) => m.name)
											.join('.')
									: ''
						  }`
						: '';
				},
				reset: () => set(initialState),
			}),
			{
				name: 'model-storage',
				storage: CustomStateStorage,
			},
		),
		{
			name: 'database',
		},
	),
);

export default useModelStore;
