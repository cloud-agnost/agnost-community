import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Database as DatabaseType, RealtimeActionParams } from '@/types';
import _ from 'lodash';
import { RealtimeActions } from './RealtimeActions';

class Database implements RealtimeActions<DatabaseType> {
	delete({ identifiers }: RealtimeActionParams<DatabaseType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useDatabaseStore.setState?.({
			databases: useDatabaseStore
				.getState?.()
				.databases.filter((database) => database._id !== identifiers.dbId),
		});

		useModelStore.setState?.((state) => ({
			models: _.omit(state.models, identifiers.dbId as string),
		}));

		removeTabByPath(identifiers.versionId as string, identifiers.dbId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				database: state.dashboard.database - 1,
			},
		}));
	}
	update({ data }: RealtimeActionParams<DatabaseType>): void {
		const { updateTab } = useTabStore.getState();
		useDatabaseStore.setState?.({
			databases: useDatabaseStore.getState?.().databases.map((database) => {
				if (database._id === data._id) {
					return data;
				}
				return database;
			}),
			database: data,
		});
		updateTab({
			versionId: data.versionId,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id),
		});
	}
	create({ data }: RealtimeActionParams<DatabaseType>): void {
		useDatabaseStore.setState?.({
			databases: [...useDatabaseStore.getState().databases, data],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				database: state.dashboard.database + 1,
			},
		}));
	}
	telemetry(param: RealtimeActionParams<DatabaseType>): void {
		this.update(param);
	}
}
export default Database;
