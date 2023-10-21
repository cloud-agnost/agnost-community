import ApplicationService from '@/services/ApplicationService';
import {
	APIError,
	AppInviteRequest,
	AppPermissions,
	AppRoles,
	Application,
	ApplicationMember,
	BaseRequest,
	ChangeAppNameRequest,
	CreateApplicationRequest,
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

import { PAGE_SIZE } from '@/constants';
import { joinChannel, leaveChannel, translate } from '@/utils';
import OrganizationService from 'services/OrganizationService.ts';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';
import useVersionStore from '../version/versionStore';

interface ApplicationStore {
	application: Application | null;
	applications: Application[];
	toDeleteApp: Application | null;
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
	appAuthorization: AppPermissions;
	isDeleteModalOpen: boolean;
	isLeaveModalOpen: boolean;
	role: AppRoles;
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
	createApplication: (req: CreateApplicationRequest) => Promise<Application | APIError>;
	leaveAppTeam: (req: DeleteApplicationRequest) => Promise<void>;
	deleteApplication: (req: DeleteApplicationRequest) => Promise<void>;
	searchApplications: (query: string) => void;
	getAppPermissions: () => Promise<AppPermissions>;
	openDeleteModal: (application: Application) => void;
	closeDeleteModal: () => void;
	openLeaveModal: (application: Application) => void;
	closeLeaveModal: () => void;
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
					appAuthorization: {} as AppPermissions,
					isDeleteModalOpen: false,
					isLeaveModalOpen: false,
					toDeleteApp: null,
					role: '' as AppRoles,
					openDeleteModal: (application: Application) => {
						set({
							isDeleteModalOpen: true,
							toDeleteApp: application,
						});
					},
					closeDeleteModal: () => {
						set({
							isDeleteModalOpen: false,
							toDeleteApp: null,
						});
					},
					openLeaveModal: (application: Application) => {
						set({
							isLeaveModalOpen: true,
							toDeleteApp: application,
						});
					},
					closeLeaveModal: () => {
						set({
							isLeaveModalOpen: false,
							toDeleteApp: null,
						});
					},
					selectApplication: (application: Application) => {
						const user = useAuthStore.getState()?.user;
						const role = application?.team.find((t) => t.userId._id === user?._id)
							?.role as AppRoles;
						set({ application, role });
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
							return tempTeam;
						} else {
							const filteredTeam = applicationTeam?.filter(({ member }) =>
								member.name.toLowerCase().includes(search.toLowerCase()),
							);
							set({ applicationTeam: filteredTeam });
							return filteredTeam;
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
					openVersionDrawer: async (application: Application) => {
						set({
							application,
						});
						const { getAllVersionsVisibleToUser, selectVersion } = useVersionStore.getState();
						const versions = await getAllVersionsVisibleToUser({
							appId: application._id,
							page: 0,
							size: PAGE_SIZE,
						});
						if (versions.length === 1) {
							selectVersion(versions[0]);
						} else
							set({
								isVersionOpen: true,
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
							applications.forEach((app) => {
								joinChannel(app._id);
							});
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
							const { app } = await OrganizationService.createApplication({ orgId, name });
							if (onSuccess) onSuccess();
							const role = app.team.find(
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								//@ts-ignore
								(team) => team.userId === useAuthStore.getState().user?._id,
							)?.role;

							set((prev) => ({
								applications: [
									...prev.applications,
									{
										...app,
										team: [
											{
												userId: {
													_id: useAuthStore.getState().user?._id as string,
													name: useAuthStore.getState().user?.name as string,
													color: useAuthStore.getState().user?.color as string,
													pictureUrl: useAuthStore.getState().user?.pictureUrl as string,
												},
												role: role as string,
												_id: '',
												joinDate: '',
											},
										],
									},
								],
								temp: [...prev.applications, app],
							}));
							joinChannel(app._id);
							return app;
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					leaveAppTeam: async ({ appId, orgId, onSuccess, onError }: DeleteApplicationRequest) => {
						try {
							await OrganizationService.leaveAppTeam(appId, orgId);
							set((prev) => ({
								applications: prev.applications.filter((app) => app._id !== appId),
								temp: prev.applications.filter((app) => app._id !== appId),
							}));
							leaveChannel(appId);
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
							leaveChannel(appId);
							if (onSuccess) onSuccess();
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					searchApplications: async (query: string) => {
						try {
							if (!query) {
								set((prev) => ({ applications: prev.temp }));
								return get().temp;
							}
							const applications = await ApplicationService.searchApps(query);
							set({ applications });
						} catch (error) {
							throw error as APIError;
						}
					},
					getAppPermissions: async () => {
						try {
							const appAuthorization = await ApplicationService.getAllAppRoleDefinitions();
							set({ appAuthorization });
							return appAuthorization;
						} catch (error) {
							throw error as APIError;
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
