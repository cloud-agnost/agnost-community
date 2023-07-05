import ApplicationService from '@/services/ApplicationService';
import {
	APIError,
	Application,
	ApplicationMember,
	ChangeAppNameRequest,
	SetAppAvatarRequest,
	TransferAppOwnershipRequest,
	TeamOption,
} from '@/types';
import { BaseRequest } from '@/types/type';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ApplicationStore {
	application: Application | null;
	applications: Application[];
	loading: boolean;
	error: APIError | null;
	isVersionOpen: boolean;
	isEditAppOpen: boolean;
	applicationTeam: ApplicationMember[];
	tempTeam: ApplicationMember[];
	teamOptions: TeamOption[];
	changeAppName: (req: ChangeAppNameRequest) => Promise<Application>;
	setAppAvatar: (req: SetAppAvatarRequest) => Promise<Application>;
	removeAppAvatar: (req: BaseRequest) => Promise<Application>;
	transferAppOwnership: (req: TransferAppOwnershipRequest) => Promise<Application>;
	getAppTeamMembers: () => Promise<ApplicationMember[]>;
	filterApplicationTeam: (search: string) => ApplicationMember[];
	openVersionDrawer: (application: Application) => void;
	closeVersionDrawer: () => void;
	openEditAppDrawer: (application: Application) => void;
	closeEditAppDrawer: () => void;
}

const useApplicationStore = create<ApplicationStore>()(
	devtools(
		persist(
			(set, get) => ({
				application: null,
				applications: [],
				applicationTeam: [],
				tempTeam: [],
				isVersionOpen: false,
				isEditAppOpen: false,
				loading: false,
				error: null,
				teamOptions: [],
				changeAppName: async (req: ChangeAppNameRequest) => {
					try {
						const application = await ApplicationService.changeAppName(req.name);
						set({ application });
						if (req.onSuccess) req.onSuccess();
						return application;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				setAppAvatar: async (req: SetAppAvatarRequest) => {
					try {
						const application = await ApplicationService.setAppAvatar(req.picture);
						set({ application });
						if (req.onSuccess) req.onSuccess();
						return application;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				removeAppAvatar: async (req: BaseRequest) => {
					try {
						const application = await ApplicationService.removeAppAvatar();
						set({ application });
						if (req.onSuccess) req.onSuccess();
						return application;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				transferAppOwnership: async (req: TransferAppOwnershipRequest) => {
					try {
						const application = await ApplicationService.transferAppOwnership(req.userId);
						set({ application });
						if (req.onSuccess) req.onSuccess();
						return application;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				getAppTeamMembers: async () => {
					try {
						const applicationTeam = await ApplicationService.getAppMembers();
						set({
							applicationTeam,
							tempTeam: applicationTeam,
							teamOptions: applicationTeam
								.filter((team) => team.role === 'Admin')
								.map((team) => ({
									label: team.member.name,
									value: team,
								})),
						});
						return applicationTeam;
					} catch (error) {
						throw error as APIError;
					}
				},
				filterApplicationTeam: (search: string) => {
					const { tempTeam, applicationTeam } = get();
					if (search === '') {
						set({ applicationTeam: tempTeam });
						return tempTeam as ApplicationMember[];
					} else {
						const filteredTeam = applicationTeam?.filter(({ member }) =>
							member.name.toLowerCase().includes(search.toLowerCase()),
						);
						console.log('filteredTeam', filteredTeam);
						set({ applicationTeam: filteredTeam as ApplicationMember[] });
						return filteredTeam as ApplicationMember[];
					}
				},
				openVersionDrawer: (application: Application) => {
					set({
						isVersionOpen: true,
						application,
					});
				},
				closeVersionDrawer: () => {
					set({
						isVersionOpen: false,
						application: null,
					});
				},
				openEditAppDrawer: (application: Application) => {
					set({
						isEditAppOpen: true,
						application,
					});
				},
				closeEditAppDrawer: () => {
					set({
						isEditAppOpen: false,
						isVersionOpen: false,
						application: null,
					});
					const searchParams = new URLSearchParams(window.location.search);
					searchParams.delete('t');
					window.history.replaceState({}, '', `${window.location.pathname}`);
				},
			}),
			{
				name: 'application-storage',
			},
		),
	),
);

export default useApplicationStore;
