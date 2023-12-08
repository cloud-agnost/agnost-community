import useModelStore from '@/store/database/modelStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Model, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Field extends RealtimeActions<Model> {
	accept(): void {
		throw new Error('Method not implemented.');
	}
	delete({ identifiers, data }: RealtimeActionParams<Model>): void {
		useModelStore.setState?.({
			model: data,
			models: useModelStore
				.getState()
				.models.map((model) => (model._id === identifiers.modelId ? data : model)),
		});
	}
	update({ data, identifiers }: RealtimeActionParams<Model>): void {
		const { updateTab } = useTabStore.getState();
		const { version } = useVersionStore.getState();
		updateTab({
			versionId: version._id,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id),
		});
		useModelStore.setState?.({
			model: data,
			models: useModelStore
				.getState()
				.models.map((model) => (model._id === identifiers.modelId ? data : model)),
		});
	}
	create({ data, identifiers }: RealtimeActionParams<Model>): void {
		useModelStore.setState?.({
			model: data,
			models: useModelStore
				.getState()
				.models.map((model) => (model._id === identifiers.modelId ? data : model)),
		});
	}
	telemetry(param: RealtimeActionParams<Model>): void {
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
