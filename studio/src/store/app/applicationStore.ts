import ApplicationService from '@/services/ApplicationService';
import {
	APIError,
	AppInviteRequest,
	Application,
	ApplicationMember,
	BaseRequest,
	ChangeAppNameRequest,
	GetInvitationRequest,
	Invitation,
	InvitationRequest,
	SetAppAvatarRequest,
	SortOption,
	TeamOption,
	TransferAppOwnershipRequest,
	UpdateRoleRequest,
} from '@/types';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { translate } from '@/utils';

interface ApplicationStore {
	application: Application | null;
	applications: Application[];
	loading: boolean;
	error: APIError | null;
	applicationTeam: ApplicationMember[];
	tempTeam: ApplicationMember[];
	teamOptions: TeamOption[];
	isVersionOpen: boolean;
	isEditAppOpen: boolean;
	isInviteMemberOpen: boolean;
	invitations: Invitation[];
	invitationPage: number;
	invitationSort: SortOption;
	invitationSearch: string;
	invitationRoleFilter: string;
	selectApplication: (application: Application) => void;
	changeAppName: (req: ChangeAppNameRequest) => Promise<Application>;
	setAppAvatar: (req: SetAppAvatarRequest) => Promise<Application>;
	removeAppAvatar: (req: BaseRequest) => Promise<Application>;
	transferAppOwnership: (req: TransferAppOwnershipRequest) => Promise<Application>;
	getAppTeamMembers: () => Promise<ApplicationMember[]>;
	filterApplicationTeam: (search: string) => ApplicationMember[];
	changeAppTeamRole: (memberId: string, role: string) => Promise<ApplicationMember>;
	removeAppMember: (memberId: string) => Promise<ApplicationMember>;
	removeMultipleAppMembers: (memberIds: string[]) => Promise<ApplicationMember[]>;
	inviteUsersToApp: (req: AppInviteRequest) => Promise<Invitation[]>;
	getAppInvitations: (req: GetInvitationRequest) => Promise<Invitation[]>;
	openVersionDrawer: (application: Application) => void;
	closeVersionDrawer: () => void;
	openEditAppDrawer: (application: Application) => void;
	closeEditAppDrawer: () => void;
	openInviteMemberDrawer: (application: Application) => void;
	closeInviteMemberDrawer: () => void;
	resendInvitation: (req: InvitationRequest) => Promise<Invitation>;
	updateInvitationUserRole: (req: UpdateRoleRequest) => Promise<Invitation>;
	deleteInvitation: (req: InvitationRequest) => Promise<Invitation>;
	deleteMultipleInvitations: (req: InvitationRequest) => Promise<Invitation[]>;
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
				isInviteMemberOpen: false,
				loading: false,
				error: null,
				teamOptions: [],
				invitations: [],
				invitationPage: 0,
				invitationSort: {
					name: translate('general.sortOptions.default'),
					value: '',
					sortDir: '',
				},
				invitationSearch: '',
				invitationRoleFilter: '',

				selectApplication: (application: Application) => {
					set({ application });
				},
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
						set({ applicationTeam: filteredTeam as ApplicationMember[] });
						return filteredTeam as ApplicationMember[];
					}
				},
				changeAppTeamRole: async (memberId: string, role: string) => {
					try {
						const applicationTeam = await ApplicationService.changeAppTeamRole(memberId, role);
						set({ applicationTeam });
					} catch (error) {
						throw error as APIError;
					}
				},
				removeAppMember: async (memberId: string) => {
					try {
						await ApplicationService.removeAppMember(memberId);
					} catch (error) {
						throw error as APIError;
					}
				},
				removeMultipleAppMembers: async (memberIds: string[]) => {
					try {
						await ApplicationService.removeMultipleAppMembers(memberIds);
					} catch (error) {
						throw error as APIError;
					}
				},
				inviteUsersToApp: async (req: AppInviteRequest) => {
					try {
						console.log('req', req);
						const invitations = await ApplicationService.inviteUsersToApp(req);
						if (req.onSuccess) req.onSuccess();
						return invitations;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				getAppInvitations: async (req: GetInvitationRequest) => {
					try {
						const invitations = await ApplicationService.getAppInvitations(req);
						if (get().invitationPage === 0) set({ invitations });
						else set({ invitations: [...get().invitations, ...invitations] });
						return invitations;
					} catch (error) {
						throw error as APIError;
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
				openInviteMemberDrawer: (application: Application) => {
					set({
						isInviteMemberOpen: true,
						application,
					});
				},
				closeInviteMemberDrawer: () => {
					set({
						isInviteMemberOpen: false,
					});
				},
				resendInvitation: async (req: InvitationRequest) => {
					try {
						await ApplicationService.resendInvitation(req.token?.toString());
						if (req.onSuccess) req.onSuccess();
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteInvitation: async (req: InvitationRequest) => {
					try {
						await ApplicationService.deleteInvitation(req.token?.toString());
						set({
							invitations: get().invitations.filter((invitation) => invitation.token !== req.token),
						});
						if (req.onSuccess) req.onSuccess();
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteMultipleInvitations: async (req: InvitationRequest) => {
					try {
						await ApplicationService.deleteMultipleInvitations(req.tokens);
						set({
							invitations: get().invitations.filter(
								(invitation) => !req.tokens?.includes(invitation.token),
							),
						});
						if (req.onSuccess) req.onSuccess();
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateInvitationUserRole: async (req: UpdateRoleRequest) => {
					try {
						await ApplicationService.updateInvitationUserRole(req.token?.toString(), req.role);
						set({
							invitations: get().invitations.map((invitation) => {
								if (invitation.token === req.token) {
									invitation.role = req.role;
								}
								return invitation;
							}),
						});

						if (req.onSuccess) req.onSuccess();
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
			}),
			{
				name: 'application-storage',
			},
		),
	),
);

export default useApplicationStore;
