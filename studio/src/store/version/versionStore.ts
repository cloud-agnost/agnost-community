import { CustomStateStorage, create } from '@/helpers';
import { VersionService } from '@/services';
import {
	APIError,
	BaseParams,
	CreateCopyOfVersionParams,
	Dashboard,
	DeleteVersionParams,
	DesignElement,
	GetVersionByIdParams,
	GetVersionLogBucketsParams,
	GetVersionLogsParams,
	GetVersionNotificationParams,
	GetVersionRequest,
	Notification,
	SearchDesignElementParams,
	UpdateVersionPropertiesParams,
	Version,
	VersionLog,
	VersionLogBucket,
} from '@/types';
import { filterMatchingKeys, getTypeWorker, history, resetAfterVersionChange } from '@/utils';
import _ from 'lodash';
import { devtools, persist } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';
interface VersionStore {
	loading: boolean;
	error: APIError;
	version: Version;
	versions: Version[];
	versionPage: number;
	createCopyVersionDrawerIsOpen: boolean;
	logBuckets: VersionLogBucket;
	deleteVersionDrawerIsOpen: boolean;
	logs: VersionLog[];
	notifications: Notification[];
	notificationsPreview: Notification[];
	lastFetchedLogCount: number;
	log: VersionLog;
	showLogDetails: boolean;
	notificationLastSeen: Date;
	notificationLastFetchedCount: number;
	designElements: DesignElement[];
	dashboard: Dashboard;
	packages: Record<string, string>;
	typings: Record<string, string>;
	lastFetchedLogPage: number;
}

type Actions = {
	selectVersion: (version: Version) => void;
	getVersionById: (req: GetVersionByIdParams) => Promise<Version>;
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<Version[]>;
	setVersionPage: (page: number) => void;
	updateVersionProperties: (params: UpdateVersionPropertiesParams) => Promise<Version>;
	createCopyOfVersion: (params: CreateCopyOfVersionParams) => Promise<Version>;
	getVersionDashboardPath: (appendPath?: string, version?: Version) => string;
	setCreateCopyVersionDrawerIsOpen: (isOpen: boolean) => void;
	getVersionLogs: (params: GetVersionLogsParams) => Promise<VersionLog[]>;
	getVersionLogBuckets: (params: GetVersionLogBucketsParams) => Promise<VersionLogBucket>;
	openVersionLogDetails: (log: VersionLog) => void;
	closeVersionLogDetails: () => void;
	deleteVersion: (params: DeleteVersionParams) => Promise<void>;
	getVersionNotifications: (params: GetVersionNotificationParams) => Promise<void>;
	getVersionNotificationsPreview: (params: GetVersionNotificationParams) => Promise<void>;
	updateNotificationLastSeen: () => void;
	searchDesignElements: (params: SearchDesignElementParams) => Promise<DesignElement[]>;
	resetDesignElements: () => void;
	getVersionDashboardInfo: (params: BaseParams) => Promise<Dashboard>;
	getNpmPackages: (params: BaseParams) => Promise<void>;
	getTypings: (params: BaseParams) => Promise<Record<string, string>>;
	fetchTypes: (packages: Record<string, string>) => Promise<void>;
	reset: () => void;
};

const initialState: VersionStore = {
	notificationLastFetchedCount: 0,
	loading: false,
	error: {} as APIError,
	deleteVersionDrawerIsOpen: false,
	version: {} as Version,
	versions: [],
	versionPage: 0,
	createCopyVersionDrawerIsOpen: false,
	logBuckets: {} as VersionLogBucket,
	logs: [],
	notifications: [],
	notificationsPreview: [],
	log: {} as VersionLog,
	lastFetchedLogCount: 0,
	showLogDetails: false,
	notificationLastSeen: new Date(),
	designElements: [],
	dashboard: {} as Dashboard,
	packages: {},
	typings: {},
	lastFetchedLogPage: 0,
};

const useVersionStore = create<VersionStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				selectVersion: (version: Version) => {
					if (version._id !== get().version._id) {
						resetAfterVersionChange();
						set({ version });
						if (_.isEmpty(get().typings)) {
							get().getNpmPackages({
								orgId: version.orgId,
								appId: version.appId,
								versionId: version._id,
							});
						}
					}

					history.navigate?.(get().getVersionDashboardPath());
				},
				setCreateCopyVersionDrawerIsOpen: (isOpen: boolean) => {
					set({ createCopyVersionDrawerIsOpen: isOpen });
				},
				getVersionById: async (params: GetVersionByIdParams) => {
					const version = await VersionService.getVersionById(params);
					set({ version });
					return version;
				},
				getAllVersionsVisibleToUser: async (req: GetVersionRequest) => {
					set({ loading: true });
					try {
						const versions = await VersionService.getAllVersionsVisibleToUser(req);
						if (!get().versionPage) set({ versions });
						else set((prev) => ({ versions: [...prev.versions, ...versions] }));
						return versions;
					} catch (error) {
						set({ error: error as APIError });
					} finally {
						set({ loading: false });
					}
				},
				setVersionPage: (page: number) => {
					set({ versionPage: page });
				},
				updateVersionProperties: async ({
					orgId,
					versionId,
					appId,
					onError,
					onSuccess,
					...data
				}: UpdateVersionPropertiesParams) => {
					try {
						const version = await VersionService.updateVersionProperties({
							orgId,
							versionId,
							appId,
							private: get().version?.private ?? false,
							defaultEndpointLimits: get().version?.defaultEndpointLimits ?? [],
							readOnly: get().version?.readOnly ?? false,
							name: get().version?.name ?? '',
							...data,
						});
						set({
							version: version,
						});
						onSuccess?.();
						return version;
					} catch (error) {
						onError?.(error as APIError);
						throw error;
					}
				},

				createCopyOfVersion: async (params: CreateCopyOfVersionParams) => {
					try {
						const { version } = await VersionService.createCopyOfVersion(params);
						set((prev) => ({ versions: [version, ...prev.versions] }));
						params.onSuccess?.(version);
						return version;
					} catch (e) {
						params.onError?.(e as APIError);
						throw e;
					}
				},

				getVersionDashboardPath: (path?: string, version?: Version) => {
					const _version = version ?? get().version;
					if (!_version) return '/organization';
					const { orgId, appId, _id } = _version;
					const urlPath = path ? `/${path.replace(/^\//, '')}` : '';
					if (path?.includes('organization')) return path;
					return `/organization/${orgId}/apps/${appId}/version/${_id}` + urlPath;
				},

				getVersionLogBuckets: async (params) => {
					try {
						const logBuckets = await VersionService.getVersionLogBuckets(params);
						set({ logBuckets });
						return logBuckets;
					} catch (error) {
						throw error as APIError;
					}
				},
				getVersionLogs: async (params) => {
					try {
						const logs = await VersionService.getVersionLogs(params);
						set({ lastFetchedLogCount: logs.length });
						if (params.page === 0) {
							set({ logs: logs });
						} else {
							set({ logs: [...get().logs, ...logs], lastFetchedLogPage: params.page });
						}
						return logs;
					} catch (error) {
						throw error as APIError;
					}
				},
				openVersionLogDetails(log) {
					set({ log, showLogDetails: true });
				},
				closeVersionLogDetails() {
					set({ log: {} as VersionLog, showLogDetails: false });
				},
				deleteVersion: async (params) => {
					try {
						await VersionService.deleteVersion(params);
						set((prev) => ({
							versions: prev.versions.filter((v) => v._id !== params.versionId),
						}));
						params.onSuccess?.();
					} catch (e) {
						const error = e as APIError;
						params.onError?.(error);
						throw e;
					}
				},
				getVersionNotifications: async (params) => {
					try {
						const notifications = await VersionService.getVersionNotifications(params);
						if (params.page === 0) {
							set({ notifications });
						} else {
							set((prev) => ({
								notifications: [...prev.notifications, ...notifications],
								notificationLastFetchedCount: notifications.length,
							}));
						}
					} catch (error) {
						throw error as APIError;
					}
				},
				getVersionNotificationsPreview: async (params) => {
					try {
						const notifications = await VersionService.getVersionNotifications(params);
						const user = useAuthStore.getState().user;

						const allowedNotifications = user?.notifications.map((ntf) => {
							if (ntf === 'org') return ntf;
							if (ntf === 'app') return `org.${ntf}`;
							if (ntf === 'version') return `org.app.${ntf}`;
							return `org.app.version.${ntf}`;
						});
						const filteredNotifications = notifications.filter(
							(ntf) => allowedNotifications?.includes(ntf.object),
						);

						set({
							notificationsPreview: filteredNotifications,
						});
					} catch (error) {
						throw error as APIError;
					}
				},
				updateNotificationLastSeen: () => {
					set({ notificationLastSeen: new Date() });
				},
				searchDesignElements: async (params) => {
					try {
						const designElements = await VersionService.searchDesignElement(params);
						set({ designElements });
						return designElements;
					} catch (error) {
						throw error as APIError;
					}
				},
				resetDesignElements: () => {
					set({ designElements: [] });
				},
				getVersionDashboardInfo: async (params) => {
					try {
						const dashboard = await VersionService.getVersionsDashboardInfo(params);
						set({ dashboard });
						return dashboard;
					} catch (error) {
						throw error as APIError;
					}
				},
				getNpmPackages: async (params) => {
					try {
						const packages = await VersionService.getNpmPackages(params);
						set({ packages });
						const typeWorker = getTypeWorker();
						const intersection = filterMatchingKeys(get().typings, packages);
						typeWorker.postMessage(intersection);
						typeWorker.onmessage = async function (e) {
							const typings = e.data;
							const specifics = await get().getTypings({
								orgId: get().version.orgId,
								appId: get().version.appId,
								versionId: get().version._id,
							});
							set({
								typings: {
									...typings,
									...specifics,
								},
							});
						};
					} catch (error) {
						throw error as APIError;
					}
				},
				getTypings: async (params) => {
					try {
						const typings = await VersionService.getVersionTypings(params);
						set((prev) => ({ typings: { ...prev.typings, ...typings } }));
						return typings;
					} catch (error) {
						throw error as APIError;
					}
				},
				fetchTypes: async (packages) => {
					const typeWorker = getTypeWorker();
					const intersection = filterMatchingKeys(get().typings, packages);
					if (_.isEmpty(intersection)) return;
					typeWorker.postMessage(intersection);
					typeWorker.onmessage = async function (e) {
						const typings = e.data;
						set((prev) => ({ typings: { ...prev.typings, ...typings } }));
					};
				},
				reset: () => set(initialState),
			}),

			{
				name: 'version-storage',
				storage: CustomStateStorage,
				partialize: (state) =>
					Object.fromEntries(
						Object.entries(state).filter(([key]) =>
							['typings', 'version', 'versions'].includes(key),
						),
					),
			},
		),
		{
			name: 'version-store',
		},
	),
);

export default useVersionStore;
