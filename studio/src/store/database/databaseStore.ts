import { create } from '@/helpers';
import { DatabaseService } from '@/services';
import {
	CreateDatabaseParams,
	Database,
	DeleteDatabaseParams,
	GetDatabaseOfAppByIdParams,
	GetDatabasesOfAppParams,
	UpdateDatabaseParams,
} from '@/types';
import { updateOrPush } from '@/utils';
import { devtools } from 'zustand/middleware';

interface DatabaseStore {
	databases: Database[];
	database: Database;
	toDeleteDatabase: Database;
	isDeleteDatabaseDialogOpen: boolean;
	isEditDatabaseDialogOpen: boolean;
}

type Actions = {
	getDatabasesOfApp: (params: GetDatabasesOfAppParams) => Promise<Database[]>;
	getDatabaseOfAppById: (params: GetDatabaseOfAppByIdParams) => Promise<Database>;
	createDatabase: (params: CreateDatabaseParams) => Promise<Database>;
	updateDatabase: (params: UpdateDatabaseParams) => Promise<Database>;
	deleteDatabase: (params: DeleteDatabaseParams) => Promise<void>;
	setDatabase: (database: Database) => void;
	openDeleteDatabaseDialog: (db: Database) => void;
	closeDeleteDatabaseDialog: () => void;
	openEditDatabaseDialog: (db: Database) => void;
	closeEditDatabaseDialog: () => void;
	reset: () => void;
};

const initialState: DatabaseStore = {
	databases: [],
	database: {} as Database,
	toDeleteDatabase: {} as Database,
	isDeleteDatabaseDialogOpen: false,
	isEditDatabaseDialogOpen: false,
};

const useDatabaseStore = create<DatabaseStore & Actions>()(
	devtools(
		(set) => ({
			...initialState,
			openDeleteDatabaseDialog: (db: Database) =>
				set({
					isDeleteDatabaseDialogOpen: true,
					toDeleteDatabase: db,
				}),
			closeDeleteDatabaseDialog: () =>
				set({
					isDeleteDatabaseDialogOpen: false,
					toDeleteDatabase: {} as Database,
				}),
			openEditDatabaseDialog: (db: Database) =>
				set({
					isEditDatabaseDialogOpen: true,
					database: db,
				}),
			closeEditDatabaseDialog: () =>
				set({
					isEditDatabaseDialogOpen: false,
					database: {} as Database,
				}),
			getDatabasesOfApp: async (params: GetDatabasesOfAppParams): Promise<Database[]> => {
				const databases = await DatabaseService.getDatabasesOfApp(params);
				set({ databases });
				return databases;
			},
			getDatabaseOfAppById: async (params: GetDatabaseOfAppByIdParams): Promise<Database> => {
				const database = await DatabaseService.getDatabaseOfAppById(params);
				set((prev) => {
					const updatedList = updateOrPush(prev.databases, database);
					return { database, databases: updatedList };
				});
				return database;
			},
			createDatabase: async (params: CreateDatabaseParams): Promise<Database> => {
				try {
					const database = await DatabaseService.createDatabase(params);
					set((prev) => ({
						databases: [database, ...prev.databases],
					}));
					return database;
				} catch (e) {
					throw e;
				}
			},
			updateDatabase: async (params: UpdateDatabaseParams): Promise<Database> => {
				const database = await DatabaseService.updateDatabaseName(params);
				set((prev) => ({
					databases: prev.databases.map((db) => (db._id === database._id ? database : db)),
				}));
				return database;
			},
			deleteDatabase: async (params: DeleteDatabaseParams) => {
				try {
					await DatabaseService.deleteDatabase(params);
					set((prev) => ({
						databases: prev.databases.filter((db) => db._id !== params.dbId),
					}));
				} catch (e) {
					throw e;
				}
			},
			setDatabase: (database: Database) => set({ database }),
			reset: () => set(initialState),
		}),
		{
			name: 'database',
		},
	),
);

export default useDatabaseStore;
