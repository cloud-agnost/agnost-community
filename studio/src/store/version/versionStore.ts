import { CustomStateStorage } from '@/helpers';
import { VersionService } from '@/services';
import {
	APIError,
	CreateCopyOfVersionParams,
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
import { history } from '@/utils';
import localforage from 'localforage';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useApplicationStore from '../app/applicationStore';
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
	selectVersion: (version: Version) => void;
	getVersionById: (req: GetVersionByIdParams) => Promise<Version>;
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<Version[]>;
	setVersionPage: (page: number) => void;
	updateVersionProperties: (params: UpdateVersionPropertiesParams) => Promise<Version>;
	createCopyOfVersion: (
		params: CreateCopyOfVersionParams,
		returnRedirect?: boolean,
	) => Promise<Version | void>;
	getVersionDashboardPath: (appendPath?: string, version?: Version) => string;
	setCreateCopyVersionDrawerIsOpen: (isOpen: boolean) => void;
	getVersionLogs: (params: GetVersionLogsParams) => Promise<void>;
	getVersionLogBuckets: (params: GetVersionLogBucketsParams) => Promise<void>;
	openVersionLogDetails: (log: VersionLog) => void;
	closeVersionLogDetails: () => void;
	deleteVersion: (params: DeleteVersionParams) => Promise<void>;
	getVersionNotifications: (params: GetVersionNotificationParams) => Promise<void>;
	updateNotificationLastSeen: () => void;
	searchDesignElements: (params: SearchDesignElementParams) => Promise<DesignElement[]>;
	resetDesignElements: () => void;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		persist(
			(set, get) => ({
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
				selectVersion: (version: Version) => {
					localforage.clear();
					set({ version });
					history.navigate?.(get().getVersionDashboardPath());
					useApplicationStore.getState().closeVersionDrawer();
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
						set({ version });
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
						set((prev) => ({ versions: [...prev.versions, version] }));
						params.onSuccess?.();
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
					if (path && path.includes('organization')) return path;
					return `/organization/${orgId}/apps/${appId}/version/${_id}` + urlPath;
				},

				getVersionLogBuckets: async (params) => {
					try {
						const logBuckets = await VersionService.getVersionLogBuckets(params);
						set({ logBuckets });
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
							set({ logs: [...get().logs, ...logs] });
						}
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
						if (params.page === 0) {
							set({ notifications, notificationsPreview: filteredNotifications });
						} else {
							set((prev) => ({
								notifications: [...prev.notifications, ...notifications],
								notificationsPreview: [
									...prev.notificationsPreview,
									...filteredNotifications,
								].splice(0, 100),
								notificationLastFetchedCount: notifications.length,
							}));
						}
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
			}),
			{
				name: 'version-storage',
				storage: CustomStateStorage,
			},
		),
	),
);

export default useVersionStore;
