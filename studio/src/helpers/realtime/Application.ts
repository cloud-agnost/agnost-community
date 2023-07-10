import { Application as ApplicationType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
import useApplicationStore from '@/store/app/applicationStore';
class Application extends RealtimeActions<ApplicationType> {
	delete({ identifiers }: RealtimeActionParams<ApplicationType>) {
		useApplicationStore.setState?.({
			applications: useApplicationStore
				.getState?.()
				.applications.filter((app) => app._id !== identifiers.appId),
		});
	}

	update({ data }: RealtimeActionParams<ApplicationType>) {
		useApplicationStore.setState?.({
			application: data,
			applications: useApplicationStore.getState?.().applications.map((app) => {
				if (app._id === data._id) {
					return data;
				}
				return app;
			}),
		});
	}
	create({ data }: RealtimeActionParams<ApplicationType>) {
		useApplicationStore.setState?.({
			applications: [...useApplicationStore.getState().applications, data],
		});
	}
}
export default Application;
