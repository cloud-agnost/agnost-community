import ApplicationService from '@/services/ApplicationService';
import {
	APIError,
	AppInviteRequest,
	Application,
	ApplicationMember,
	BaseRequest,
	ChangeAppNameRequest,
	CreateApplicationRequest,
	CreateApplicationResponse,
	DeleteApplicationRequest,
	GetInvitationRequest,
	Invitation,
	InvitationRequest,
	RemoveMemberRequest,
	SetAppAvatarRequest,
	SortOption,
	TeamOption,
	TransferAppOwnershipRequest,
	UpdateRoleRequest,
} from '@/types';

import { translate } from '@/utils';
import OrganizationService from 'services/OrganizationService.ts';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';

interface ApplicationStore {
	application: Application | null;
	applications: Application[];
	temp: Application[];
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
	invitationRoleFilter: string[] | null;
	selectApplication: (application: Application) => void;
	changeAppName: (req: ChangeAppNameRequest) => Promise<Application>;
	setAppAvatar: (req: SetAppAvatarRequest) => Promise<Application>;
	removeAppAvatar: (req: BaseRequest) => Promise<Application>;
	transferAppOwnership: (req: TransferAppOwnershipRequest) => Promise<Application>;
	getAppTeamMembers: () => Promise<ApplicationMember[]>;
	filterApplicationTeam: (search: string) => ApplicationMember[];
	changeAppTeamRole: (req: UpdateRoleRequest) => Promise<ApplicationMember>;
	removeAppMember: (req: RemoveMemberRequest) => Promise<void>;
	removeMultipleAppMembers: (req: RemoveMemberRequest) => Promise<void>;
	inviteUsersToApp: (req: AppInviteRequest) => Promise<Invitation[]>;
	getAppInvitations: (req: GetInvitationRequest) => Promise<Invitation[]>;
	openVersionDrawer: (application: Application) => void;
	closeVersionDrawer: (clearApp?: boolean) => void;
	openEditAppDrawer: (application: Application) => void;
	closeEditAppDrawer: (clearApp?: boolean) => void;
	openInviteMemberDrawer: (application: Application) => void;
	closeInviteMemberDrawer: () => void;
	resendInvitation: (req: InvitationRequest) => Promise<void>;
	updateInvitationUserRole: (req: UpdateRoleRequest) => Promise<Invitation>;
	deleteInvitation: (req: InvitationRequest) => Promise<void>;
	deleteMultipleInvitations: (req: InvitationRequest) => Promise<void>;
	getAppsByOrgId: (orgId: string) => Promise<Application[] | APIError>;
	createApplication: (
		req: CreateApplicationRequest,
	) => Promise<CreateApplicationResponse | APIError>;
	leaveAppTeam: (req: DeleteApplicationRequest) => Promise<void>;
	deleteApplication: (req: DeleteApplicationRequest) => Promise<void>;
	searchApplications: (query: string) => Promise<Application[] | APIError>;
}

const useApplicationStore = create<ApplicationStore>()(
	subscribeWithSelector(
		devtools(
			persist(
				(set, get) => ({
					application: null,
					applications: [],
					temp: [],
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
					invitationRoleFilter: [],

					selectApplication: (application: Application) => {
						console.log('selectApplication', application);
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
							const userId = useAuthStore.getState().user?._id;
							set({
								applicationTeam,
								tempTeam: applicationTeam,
								teamOptions: applicationTeam
									.filter((team) => team.role === 'Admin' && userId !== team.member._id)
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
					changeAppTeamRole: async (req: UpdateRoleRequest) => {
						const { userId, role, onSuccess, onError } = req;
						try {
							const member = await ApplicationService.changeMemberRole(userId as string, role);
							set({
								applicationTeam: get().applicationTeam.map((team) => {
									if (team.member._id === userId) {
										team.role = role;
									}
									return team;
								}),
							});
							if (onSuccess) onSuccess();
							return member;
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					removeAppMember: async (req: RemoveMemberRequest) => {
						try {
							await ApplicationService.removeAppMember(req.userId as string);
							set({
								applicationTeam: get().applicationTeam.filter(
									(team) => team.member._id !== req.userId,
								),
							});
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					removeMultipleAppMembers: async (req: RemoveMemberRequest) => {
						try {
							await ApplicationService.removeMultipleAppMembers(req.userIds as string[]);
							set({
								applicationTeam: get().applicationTeam.filter(
									(team) => !req.userIds?.includes(team.member._id),
								),
							});
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
					closeVersionDrawer: (clearApp?: boolean) => {
						set({
							isVersionOpen: false,
							...(clearApp && { application: null }),
						});
					},
					openEditAppDrawer: (application: Application) => {
						set({
							isEditAppOpen: true,
							application,
						});
					},
					closeEditAppDrawer: (clearApp?: boolean) => {
						set({
							isEditAppOpen: false,
							isVersionOpen: false,
							...(clearApp && { application: null }),
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
							await ApplicationService.resendInvitation(req.token as string);
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					deleteInvitation: async (req: InvitationRequest) => {
						try {
							await ApplicationService.deleteInvitation(req.token as string);
							set({
								invitations: get().invitations.filter(
									(invitation) => invitation.token !== req.token,
								),
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
							const invitation = await ApplicationService.updateInvitationUserRole(
								req.token as string,
								req.role,
							);
							set({
								invitations: get().invitations.map((invitation) => {
									if (invitation.token === req.token) {
										invitation.role = req.role;
									}
									return invitation;
								}),
							});
							if (req.onSuccess) req.onSuccess();
							return invitation;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					getAppsByOrgId: async (orgId: string) => {
						try {
							set({ loading: true });
							const applications = await OrganizationService.getOrganizationApps(orgId);
							set({ applications, temp: applications });
							return applications;
						} catch (error) {
							throw error as APIError;
						} finally {
							set({ loading: false });
						}
					},
					createApplication: async ({
						orgId,
						name,
						onSuccess,
						onError,
					}: CreateApplicationRequest) => {
						try {
							set({ loading: true });
							const res = await OrganizationService.createApplication({ orgId, name });
							if (onSuccess) onSuccess();
							set((prev) => ({
								applications: [...prev.applications, res.app],
								temp: [...prev.applications, res.app],
							}));
							return res;
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						} finally {
							set({ loading: false });
						}
					},
					leaveAppTeam: async ({ appId, orgId, onSuccess, onError }: DeleteApplicationRequest) => {
						try {
							await OrganizationService.leaveAppTeam(appId, orgId);
							set((prev) => ({
								applications: prev.applications.filter((app) => app._id !== appId),
								temp: prev.applications.filter((app) => app._id !== appId),
							}));
							if (onSuccess) onSuccess();
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					deleteApplication: async ({
						appId,
						orgId,
						onSuccess,
						onError,
					}: DeleteApplicationRequest) => {
						try {
							await OrganizationService.deleteApplication(appId, orgId);
							set((prev) => ({
								applications: prev.applications.filter((app) => app._id !== appId),
								temp: prev.applications.filter((app) => app._id !== appId),
							}));
							if (onSuccess) onSuccess();
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					searchApplications: async (query: string) => {
						try {
							if (query === '') {
								set((prev) => ({ applications: prev.temp }));
								return get().temp;
							}
							set({ loading: true });
							const res = get().temp.filter((app) =>
								app.name.toLowerCase().includes(query.toLowerCase()),
							);
							set({ applications: res });
							return res;
						} catch (error) {
							throw error as APIError;
						} finally {
							set({ loading: false });
						}
					},
				}),
				{
					name: 'application-storage',
				},
			),
		),
	),
);

export default useApplicationStore;
