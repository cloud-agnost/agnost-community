import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ModelService } from '@/services';
import {
	APIError,
	CreateModelParams,
	GetModelsOfDatabaseParams,
	Model,
	UpdateNameAndDescriptionParams,
} from '@/types';
import { notify } from '@/utils';

interface ModelStore {
	models: Model[];
	modelToEdit: Model | null;
	isOpenEditModelDialog: boolean;
	setModelToEdit: (model: Model | null) => void;
	setIsOpenEditModelDialog: (isOpen: boolean) => void;
	getModelsOfDatabase: (params: GetModelsOfDatabaseParams) => Promise<Model[]>;
	createModel: (params: CreateModelParams) => Promise<Model>;
	updateNameAndDescription: (params: UpdateNameAndDescriptionParams) => Promise<Model>;
}

const useModelStore = create<ModelStore>()(
	devtools(
		persist(
			(set) => ({
				models: [],
				modelToEdit: null,
				isOpenEditModelDialog: false,
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
			}),
			{
				name: 'database-storage',
			},
		),
		{
			name: 'database',
		},
	),
);

export default useModelStore;
