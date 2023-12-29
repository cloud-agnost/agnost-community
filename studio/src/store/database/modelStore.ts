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
	FieldType,
	GetModelsOfDatabaseParams,
	GetSpecificModelByIidOfDatabase,
	GetSpecificModelOfDatabase,
	Model,
	UpdateFieldParams,
	UpdateNameAndDescriptionParams,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ModelStore {
	models: Model[];
	model: Model;
	field: Field;
	subModel: Model;
	referenceModels: Model[];
	nestedModels: {
		name: string;
		index: number;
	}[];
	isEditModelDialogOpen: boolean;
	isEditFieldDialogOpen: boolean;
	selectedType: FieldType;
	isModelsFetched: boolean;
}

type Actions = {
	openEditModelDialog: (model: Model) => void;
	closeEditModelDialog: () => void;
	openEditFieldDialog: (field: Field) => void;
	closeEditFieldDialog: () => void;
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
	setSelectedType: (selectedType: FieldType) => void;
	reset: () => void;
};

const initialState: ModelStore = {
	models: [],
	model: {} as Model,
	subModel: {} as Model,
	field: {} as Field,
	nestedModels: [],
	referenceModels: [],
	isEditModelDialogOpen: false,
	isEditFieldDialogOpen: false,
	selectedType: {} as FieldType,
	isModelsFetched: false,
};

const useModelStore = create<ModelStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				openEditModelDialog: (model: Model) =>
					set({
						isEditModelDialogOpen: true,
						model,
					}),
				closeEditModelDialog: () =>
					set({
						isEditModelDialogOpen: false,
						model: {} as Model,
					}),
				openEditFieldDialog: (field: Field) =>
					set({
						isEditFieldDialogOpen: true,
						field,
					}),
				closeEditFieldDialog: () =>
					set({
						isEditFieldDialogOpen: false,
						field: {} as Field,
					}),

				getModelsOfDatabase: async (params: GetModelsOfDatabaseParams): Promise<Model[]> => {
					const models = await ModelService.getModelsOfDatabase(params);
					set({ models, isModelsFetched: true });
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
						if (params.onError) params.onError(e as APIError);
						throw e;
					}
				},
				getSpecificModelOfDatabase: async (params: GetSpecificModelOfDatabase): Promise<Model> => {
					try {
						const model = await ModelService.getSpecificModelOfDatabase(params);
						set({ model });
						return model;
					} catch (e) {
						throw e;
					}
				},
				createModel: async (params: CreateModelParams): Promise<Model> => {
					try {
						const model = await ModelService.createModel(params);
						set((state) => ({ models: [model, ...state.models] }));
						return model;
					} catch (e) {
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
						throw e;
					}
				},
				addNewField: async (params: AddNewFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.addNewField(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
							model: model,
						}));
						return model;
					} catch (e) {
						throw e;
					}
				},
				deleteField: async (params: DeleteFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.deleteField(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
							model,
						}));
						return model;
					} catch (e) {
						throw e;
					}
				},
				deleteMultipleField: async (params: DeleteMultipleFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.deleteMultipleField(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
							model,
						}));
						return model;
					} catch (e) {
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
						throw e;
					}
				},
				updateField: async (params: UpdateFieldParams): Promise<Model> => {
					try {
						const model = await ModelService.updateField(params);
						set((state) => ({
							models: state.models.map((m) => (m._id === model._id ? model : m)),
							model,
						}));
						return model;
					} catch (e) {
						throw e;
					}
				},
				getReferenceModels: async (params: GetModelsOfDatabaseParams): Promise<Model[]> => {
					try {
						const referenceModels = await ModelService.getReferenceModels(params);
						set({ referenceModels });
						return referenceModels;
					} catch (e) {
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
				setSelectedType: (selectedType: FieldType) => set({ selectedType }),
				reset: () => set(initialState),
			}),
			{
				name: 'model-store',
				partialize: (state) =>
					Object.fromEntries(Object.entries(state).filter(([key]) => ['model'].includes(key))),
			},
		),
	),
);

export default useModelStore;
