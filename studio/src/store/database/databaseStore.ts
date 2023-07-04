import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DatabaseService } from '@/services';
import {
	CreateDatabaseParams,
	DeleteDatabaseParams,
	GetDatabaseOfAppByIdParams,
	GetDatabasesOfAppParams,
	UpdateDatabaseNameParams,
} from '@/types';

interface DatabaseStore {
	apps: object[];
	appLogs: object[];
	setApps: (apps: object[]) => void;
	setAppLogs: (appLogs: object[]) => void;
	getDatabasesOfApp: (params: GetDatabasesOfAppParams) => Promise<any>;
	getDatabaseOfAppById: (params: GetDatabaseOfAppByIdParams) => Promise<any>;
	createDatabase: (params: CreateDatabaseParams) => Promise<any>;
	updateDatabaseName: (params: UpdateDatabaseNameParams) => Promise<any>;
	deleteDatabase: (params: DeleteDatabaseParams) => Promise<any>;
}

const useDatabaseStore = create<DatabaseStore>()(
	devtools(
		persist(
			(set) => ({
				apps: [],
				appLogs: [],
				setApps: (apps: object[]) => set({ apps }),
				setAppLogs: (appLogs: object[]) => set({ appLogs }),
				getDatabasesOfApp: (params: GetDatabasesOfAppParams) => {
					return DatabaseService.getDatabasesOfApp(params);
				},
				getDatabaseOfAppById: (params: GetDatabaseOfAppByIdParams) => {
					return DatabaseService.getDatabaseOfAppById(params);
				},
				createDatabase: (params: CreateDatabaseParams) => {
					return DatabaseService.createDatabase(params);
				},
				updateDatabaseName: (params: UpdateDatabaseNameParams) => {
					return DatabaseService.updateDatabaseName(params);
				},
				deleteDatabase: (params: DeleteDatabaseParams) => {
					return DatabaseService.deleteDatabase(params);
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

export default useDatabaseStore;
