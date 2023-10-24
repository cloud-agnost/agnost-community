import useModelStore from '@/store/database/modelStore';
import useTabStore from '@/store/version/tabStore';
import { Model as ModelType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';

class Model extends RealtimeActions<ModelType> {
	delete({ identifiers }: RealtimeActionParams<ModelType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useModelStore.setState?.({
			models: useModelStore
				.getState?.()
				.models.filter((model) => model._id !== identifiers.modelId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.modelId as string);
	}
	update({ data }: RealtimeActionParams<ModelType>): void {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
		useModelStore.setState?.({
			models: useModelStore.getState?.().models.map((model) => {
				if (model._id === data._id) {
					return data;
				}
				return model;
			}),
			model: data,
		});
	}
	create({ data }: RealtimeActionParams<ModelType>): void {
		useModelStore.setState?.({
			models: [...useModelStore.getState().models, data],
		});
	}
	telemetry(param: RealtimeActionParams<ModelType>): void {
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

export default Model;
