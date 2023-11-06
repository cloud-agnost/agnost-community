import { create } from '@/helpers';
import { t } from '@/i18n/config.ts';
import OrganizationService from '@/services/OrganizationService';
import {
	APIError,
	ChangeOrganizationAvatarRequest,
	ChangeOrganizationNameRequest,
	CreateOrganizationRequest,
	GetInvitationRequest,
	GetOrganizationMembersRequest,
	Invitation,
	InvitationRequest,
	InviteOrgRequest,
	LeaveOrganizationRequest,
	OrgPermissions,
	Organization,
	OrganizationMember,
	RemoveMemberFromOrganizationRequest,
	SortOption,
	TransferOrganizationRequest,
	UpdateRoleRequest,
} from '@/types';
import { BaseRequest } from '@/types/type';
import { joinChannel, leaveChannel, resetAfterOrgChange, translate } from '@/utils';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
interface OrganizationStore {
	loading: boolean;
	organization: Organization;
	organizations: Organization[];
	members: OrganizationMember[];
	invitations: Invitation[];
	memberSearch: string;
	memberRoleFilter: string[];
	memberSort: SortOption;
	selectedTab: 'member' | 'invitation';
	orgAuthorization: OrgPermissions;
	memberPage: number;
}

type Actions = {
	getAllOrganizationByUser: () => Promise<Organization[] | APIError>;
	createOrganization: (req: CreateOrganizationRequest) => Promise<Organization | APIError>;
	selectOrganization: (organization: Organization) => void;
	leaveOrganization: (req: LeaveOrganizationRequest) => Promise<void>;
	changeOrganizationName: (req: ChangeOrganizationNameRequest) => Promise<Organization>;
	changeOrganizationAvatar: (req: ChangeOrganizationAvatarRequest) => Promise<Organization>;
	removeOrganizationAvatar: (req: BaseRequest) => Promise<Organization>;
	transferOrganization: (req: TransferOrganizationRequest) => Promise<Organization>;
	deleteOrganization: (req: BaseRequest) => Promise<void>;
	inviteUsersToOrganization: (req: InviteOrgRequest) => Promise<void>;
	deleteInvitation: (req: InvitationRequest) => Promise<void>;
	deleteMultipleInvitations: (req: InvitationRequest) => Promise<void>;
	resendInvitation: (req: InvitationRequest) => Promise<void>;
	removeMemberFromOrganization: (req: RemoveMemberFromOrganizationRequest) => Promise<void>;
	removeMultipleMembersFromOrganization: (
		req: RemoveMemberFromOrganizationRequest,
	) => Promise<void>;
	updateInvitationUserRole: (req: UpdateRoleRequest) => Promise<Invitation>;
	changeMemberRole: (req: UpdateRoleRequest) => Promise<OrganizationMember>;
	getOrganizationMembers: (req: GetOrganizationMembersRequest) => Promise<OrganizationMember[]>;
	getOrganizationInvitations: (req: GetInvitationRequest) => Promise<Invitation[] | APIError>;
	setMemberSearch: (search: string) => void;
	setMemberRoleFilter: (roles: string[]) => void;
	setMemberSort: (sort: SortOption) => void;
	clearFilter: () => void;
	getOrgPermissions: () => Promise<OrgPermissions>;
	setMemberPage: (page: number) => void;
	reset: () => void;
};

const initialState: OrganizationStore = {
	loading: false,
	organization: {} as Organization,
	organizations: [],
	members: [],
	invitations: [],
	memberSearch: '',
	memberRoleFilter: [],
	memberSort: {
		name: t('general.sortOptions.default'),
		value: '',
		sortDir: '',
	},
	memberPage: 0,
	selectedTab: 'member',
	orgAuthorization: {} as OrgPermissions,
};

const useOrganizationStore = create<OrganizationStore & Actions>()(
	subscribeWithSelector(
		devtools(
			persist(
				(set, get) => ({
					...initialState,
					getAllOrganizationByUser: async () => {
						try {
							set({ loading: true });
							const res = await OrganizationService.getAllOrganizationsByUser();
							set({ organizations: res, loading: false });
							res.forEach((organization) => {
								joinChannel(organization._id);
							});
							return res;
						} catch (error) {
							throw error as APIError;
						}
					},
					createOrganization: async ({ name, onSuccess, onError }: CreateOrganizationRequest) => {
						try {
							const res = await OrganizationService.createOrganization(name);
							set({
								organizations: [
									{
										...res,
										role: 'Admin',
									},
									...get().organizations,
								],
							});
							if (onSuccess) onSuccess();
							joinChannel(res._id);
							return res;
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					selectOrganization: (organization: Organization) => {
						const oldOrganization = get().organization;
						if (organization._id !== oldOrganization?._id) {
							leaveChannel(oldOrganization._id);
							resetAfterOrgChange();
						}
						set({ organization });
						joinChannel(organization._id);
					},
					leaveOrganization: async ({
						organizationId,
						onSuccess,
						onError,
					}: LeaveOrganizationRequest) => {
						try {
							await OrganizationService.leaveOrganization(organizationId);
							set({
								organizations: get().organizations.filter(
									(organization) => organization._id !== organizationId,
								),
							});
							if (onSuccess) onSuccess();
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					changeOrganizationName: async ({
						name,
						organizationId,
						onSuccess,
						onError,
					}: ChangeOrganizationNameRequest) => {
						try {
							const res = await OrganizationService.changeOrganizationName(name, organizationId);
							set({
								organizations: get().organizations.map((organization) => {
									if (organization._id === organizationId) {
										return res;
									}
									return organization;
								}),
								organization: res,
							});
							if (onSuccess) onSuccess();
							return res;
						} catch (error) {
							if (onError) onError(error as APIError);
							throw error as APIError;
						}
					},
					changeOrganizationAvatar: async (req: ChangeOrganizationAvatarRequest) => {
						try {
							const res = await OrganizationService.changeOrganizationAvatar(req);
							set({
								organization: res,
							});
							if (req.onSuccess) req.onSuccess();
							return res;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					removeOrganizationAvatar: async (req: BaseRequest) => {
						try {
							const res = await OrganizationService.removeOrganizationAvatar(
								get()?.organization?._id as string,
							);
							set({
								organization: res,
							});
							if (req.onSuccess) req.onSuccess();
							return res;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					transferOrganization: async (req: TransferOrganizationRequest) => {
						try {
							const res = await OrganizationService.transferOrganization(
								req.organizationId,
								req.userId,
							);
							set({
								organizations: get().organizations.filter(
									(organization) => organization._id !== get()?.organization?._id,
								),
								organization: {} as Organization,
							});
							if (req.onSuccess) req.onSuccess();
							return res;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					deleteInvitation: async (req: InvitationRequest) => {
						try {
							await OrganizationService.deleteInvitation(req.token as string);
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
							await OrganizationService.deleteMultipleInvitations(req.tokens as string[]);
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
					resendInvitation: async (req: InvitationRequest) => {
						try {
							await OrganizationService.resendInvitation(req.token as string);
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					removeMemberFromOrganization: async (req: RemoveMemberFromOrganizationRequest) => {
						try {
							await OrganizationService.removeMemberFromOrganization(req.userId as string);
							set({
								members: get().members.filter(({ member }) => member._id !== req.userId),
							});
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					removeMultipleMembersFromOrganization: async (
						req: RemoveMemberFromOrganizationRequest,
					) => {
						try {
							await OrganizationService.removeMultipleMembersFromOrganization(
								req.userIds as string[],
							);
							set({
								members: get().members.filter(({ member }) => !req.userIds?.includes(member._id)),
							});
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					getOrganizationMembers: async (req: GetOrganizationMembersRequest) => {
						try {
							const members = await OrganizationService.getOrganizationMembers(req);
							set({
								members,
							});
							return members;
						} catch (error) {
							throw error as APIError;
						}
					},
					deleteOrganization: async (req: BaseRequest) => {
						try {
							await OrganizationService.deleteOrganization(get()?.organization?._id as string);
							set({
								organizations: get().organizations.filter(
									(organization) => organization._id !== get()?.organization?._id,
								),
								organization: {} as Organization,
							});
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					inviteUsersToOrganization: async (req: InviteOrgRequest) => {
						try {
							set({
								loading: true,
							});
							const res = await OrganizationService.inviteUsersToOrganization(req);
							set({
								invitations: [...get().invitations, ...res],
							});
							if (req.onSuccess) req.onSuccess();
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						} finally {
							set({
								loading: false,
							});
						}
					},
					getOrganizationInvitations: async (req: GetInvitationRequest) => {
						try {
							const invitations = await OrganizationService.getOrganizationInvitations(req);
							if (get().memberPage === 0) set({ invitations });
							else set({ invitations: [...get().invitations, ...invitations] });
							return invitations;
						} catch (error) {
							throw error as APIError;
						}
					},
					updateInvitationUserRole: async (req: UpdateRoleRequest) => {
						try {
							const res = await OrganizationService.updateInvitationUserRole(
								req?.token as string,
								req.role,
							);
							set({
								invitations: get().invitations.map((invitation) => {
									if (invitation.token === req.token) {
										return res;
									}
									return invitation;
								}),
							});
							if (req.onSuccess) req.onSuccess();
							return res;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					changeMemberRole: async (req: UpdateRoleRequest) => {
						try {
							const res = await OrganizationService.changeMemberRole(
								req?.userId as string,
								req.role,
							);
							set({
								members: get().members.map((m) => {
									if (m.member._id === req.userId) {
										return res;
									}
									return m;
								}),
							});
							if (req.onSuccess) req.onSuccess();
							return res;
						} catch (error) {
							if (req.onError) req.onError(error as APIError);
							throw error as APIError;
						}
					},
					setMemberPage: (page: number) => {
						set({ memberPage: page });
					},
					setMemberSearch: (search: string) => {
						set({ memberSearch: search, memberPage: 0 });
					},
					setMemberRoleFilter: (roles: string[]) => {
						set({ memberRoleFilter: roles, memberPage: 0 });
					},
					setMemberSort: (sort: SortOption) => {
						set({ memberSort: sort, memberPage: 0 });
					},
					clearFilter: () => {
						set({
							memberSearch: '',
							memberRoleFilter: [],
							memberSort: {
								name: translate('general.sortOptions.default'),
								value: '',
								sortDir: '',
							},
						});
					},
					async getOrgPermissions() {
						const orgAuthorization = await OrganizationService.getAllOrganizationRoleDefinitions();
						set({ orgAuthorization });
						return orgAuthorization;
					},
					reset: () => set(initialState),
				}),
				{
					name: 'organization-storage',
				},
			),
		),
	),
);

export default useOrganizationStore;
