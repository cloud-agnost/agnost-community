import useFunctionStore from '@/store/function/functionStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { HelperFunction, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
export default class Function implements RealtimeActions<HelperFunction> {
	delete({ identifiers }: RealtimeActionParams<HelperFunction>): void {
		const { removeTabByPath } = useTabStore.getState();
		useFunctionStore.setState?.({
			functions: useFunctionStore
				.getState?.()
				.functions.filter((ep) => ep._id !== identifiers.functionId),
		});

		removeTabByPath(identifiers.versionId as string, identifiers.functionId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				function: state.dashboard.function - 1,
			},
		}));
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
		});
		if (data.logic) {
			useFunctionStore.getState?.().setLogics(data._id, data.logic);
		}
	}
	create({ data }: RealtimeActionParams<HelperFunction>): void {
		useFunctionStore.setState?.({
			functions: [...useFunctionStore.getState().functions, data],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				function: state.dashboard.function + 1,
			},
		}));
	}
	telemetry(param: RealtimeActionParams<HelperFunction>): void {
		this.update(param);
	}
}
