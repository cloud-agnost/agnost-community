import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DatabaseService } from '@/services';
import {
	APIError,
	CreateDatabaseParams,
	Database,
	DeleteDatabaseParams,
	GetDatabaseOfAppByIdParams,
	GetDatabasesOfAppParams,
	UpdateDatabaseNameParams,
} from '@/types';
import { notify } from '@/utils';

interface DatabaseStore {
	databases: Database[];
	databasesForSearch: Database[];
	database: Database | null;
	toEditDatabase: Database | null;
	apps: object[];
	appLogs: object[];
	editDatabaseDialogOpen: boolean;
	setToEditDatabase: (database: Database) => void;
	setEditDatabaseDialogOpen: (open: boolean) => void;
	setApps: (apps: object[]) => void;
	setAppLogs: (appLogs: object[]) => void;
	getDatabasesOfApp: (params: GetDatabasesOfAppParams) => Promise<Database[]>;
	getDatabaseOfAppById: (params: GetDatabaseOfAppByIdParams) => Promise<Database>;
	createDatabase: (params: CreateDatabaseParams) => Promise<Database>;
	updateDatabaseName: (params: UpdateDatabaseNameParams) => Promise<Database>;
	deleteDatabase: (params: DeleteDatabaseParams) => Promise<void>;
	searchDatabases: (search: string) => void;
}

const useDatabaseStore = create<DatabaseStore>()(
	devtools(
		persist(
			(set) => ({
				databases: [],
				databasesForSearch: [],
				database: null,
				editDatabaseDialogOpen: false,
				apps: [],
				appLogs: [],
				toEditDatabase: null,
				setToEditDatabase: (database: Database) => set({ toEditDatabase: database }),
				setEditDatabaseDialogOpen: (open: boolean) => {
					if (!open) {
						set({ toEditDatabase: null });
					}
					set({ editDatabaseDialogOpen: open });
				},
				setApps: (apps: object[]) => set({ apps }),
				setAppLogs: (appLogs: object[]) => set({ appLogs }),
				getDatabasesOfApp: async (params: GetDatabasesOfAppParams): Promise<Database[]> => {
					const databases = await DatabaseService.getDatabasesOfApp(params);
					set({ databases, databasesForSearch: databases });
					return databases;
				},
				getDatabaseOfAppById: async (params: GetDatabaseOfAppByIdParams): Promise<Database> => {
					const database = await DatabaseService.getDatabaseOfAppById(params);
					set({ database });
					return database;
				},
				createDatabase: async (params: CreateDatabaseParams): Promise<Database> => {
					try {
						const database = await DatabaseService.createDatabase(params);
						set((prev) => ({
							databases: [...prev.databases, database],
							databasesForSearch: [...prev.databases, database],
						}));
						return database;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				updateDatabaseName: async (params: UpdateDatabaseNameParams): Promise<Database> => {
					const database = await DatabaseService.updateDatabaseName(params);
					set((prev) => ({
						databases: prev.databases.map((db) => (db._id === database._id ? database : db)),
						databasesForSearch: prev.databases.map((db) =>
							db._id === database._id ? database : db,
						),
					}));
					return database;
				},
				deleteDatabase: async (params: DeleteDatabaseParams) => {
					try {
						await DatabaseService.deleteDatabase(params);
						set((prev) => ({
							databases: prev.databases.filter((db) => db._id !== params.dbId),
							databasesForSearch: prev.databases.filter((db) => db._id !== params.dbId),
						}));
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				searchDatabases: (search: string) => {
					if (!search) {
						set((prev) => ({
							databasesForSearch: prev.databases,
						}));
					} else {
						set((prev) => ({
							databasesForSearch: prev.databases.filter((db) =>
								db.name.toLowerCase().includes(search.toLowerCase()),
							),
						}));
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

export default useDatabaseStore;
