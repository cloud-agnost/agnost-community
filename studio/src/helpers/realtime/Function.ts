import useFunctionStore from '@/store/function/functionStore';
import useTabStore from '@/store/version/tabStore';
import { HelperFunction, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
export default class Function extends RealtimeActions<HelperFunction> {
	delete({ identifiers }: RealtimeActionParams<HelperFunction>): void {
		const { removeTabByPath } = useTabStore.getState();
		useFunctionStore.setState?.({
			functions: useFunctionStore
				.getState?.()
				.functions.filter((ep) => ep._id !== identifiers.functionId),
		});

		removeTabByPath(identifiers.versionId as string, identifiers.functionId as string);
	}
	update({ data }: RealtimeActionParams<HelperFunction>): void {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id),
		});
		useFunctionStore.setState?.({
			functions: useFunctionStore.getState?.().functions.map((ep) => {
				if (ep._id === data._id) {
					return data;
				}
				return ep;
			}),
			function: data,
			editedLogic: data.logic,
		});
	}
	create({ data }: RealtimeActionParams<HelperFunction>): void {
		useFunctionStore.setState?.({
			functions: [...useFunctionStore.getState().functions, data],
		});
	}
	telemetry(param: RealtimeActionParams<HelperFunction>): void {
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
