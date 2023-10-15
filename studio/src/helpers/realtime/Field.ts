import useModelStore from '@/store/database/modelStore';
import { Field as FieldType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Field extends RealtimeActions<FieldType> {
	delete({ identifiers }: RealtimeActionParams<FieldType>): void {
		useModelStore.setState?.({
			model: {
				...useModelStore.getState().model,
				fields: useModelStore
					.getState?.()
					.model.fields.filter((field) => field._id !== identifiers.fieldId),
			},
			models: useModelStore.getState().models.map((model) => {
				if (model._id === identifiers.modelId) {
					return {
						...model,
						fields: model.fields.filter((field) => field._id !== identifiers.fieldId),
					};
				}
				return model;
			}),
		});
	}
	update({ data, identifiers }: RealtimeActionParams<FieldType>): void {
		useModelStore.setState?.({
			model: {
				...useModelStore.getState().model,
				fields: useModelStore.getState().model.fields.map((field) => {
					if (field._id === data._id) {
						return data;
					}
					return field;
				}),
			},
			models: useModelStore.getState().models.map((model) => {
				if (model._id === identifiers.modelId) {
					return {
						...model,
						fields: model.fields.map((field) => {
							if (field._id === data._id) {
								return data;
							}
							return field;
						}),
					};
				}
				return model;
			}),
		});
	}
	create({ data, identifiers }: RealtimeActionParams<FieldType>): void {
		useModelStore.setState?.({
			model: {
				...useModelStore.getState().model,
				fields: [...useModelStore.getState().model.fields, data],
			},
			models: useModelStore.getState().models.map((model) => {
				if (model._id === identifiers.modelId) {
					return {
						...model,
						fields: [...model.fields, data],
					};
				}
				return model;
			}),
		});
	}
	telemetry(param: RealtimeActionParams<FieldType>): void {
		this.update(param);
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
}

export default Field;
