import { Button } from '@/components/Button';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import { Separator } from '@/components/Separator';
import { PAGE_SIZE } from '@/constants';
import { OrganizationInvitationTable, OrganizationMembersTable } from '@/features/organization';
import { useUpdateEffect } from '@/hooks';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import useClusterStore from '@/store/cluster/clusterStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTypeStore from '@/store/types/typeStore';
import { APIError, OrgMemberRequest } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '../organization.scss';
import { useParams } from 'react-router-dom';

export default function OrganizationSettingsMembers() {
	const { t } = useTranslation();
	const { canClusterSendEmail } = useClusterStore();
	const canInvite = useAuthorizeOrg('invite.create');
	const { orgId, appId } = useParams() as Record<string, string>;
	const {
		inviteUsersToOrganization,
		getOrganizationInvitations,
		getOrganizationMembers,
		clearFilter,
		organization,
		memberPage,
		memberSearch,
		memberRoleFilter,
		memberSort,
		selectedTab,
	} = useOrganizationStore();

	function onSubmit(data: OrgMemberRequest[], setError: (error: APIError) => void) {
		if (data.length) {
			inviteUsersToOrganization({
				organizationId: organization?._id as string,
				members: data,
				uiBaseURL: window.location.origin,
				onError: (error) => setError(error),
			});
		}
	}

	const { orgRoles } = useTypeStore();

	const getMemberRequest = useMemo(
		() => ({
			page: memberPage,
			size: PAGE_SIZE,
			organizationId: organization?._id as string,
			...(selectedTab === 'member' ? { search: memberSearch } : { email: memberSearch }),
			sortBy: memberSort.value,
			sortDir: memberSort.sortDir,
			roles: memberRoleFilter,
		}),
		[memberPage, memberSearch, memberSort, memberRoleFilter],
	);

	useUpdateEffect(() => {
		if (selectedTab === 'member') {
			getOrganizationMembers(getMemberRequest);
		} else {
			getOrganizationInvitations({
				...getMemberRequest,
				orgId,
				appId,
				status: 'Pending',
			});
		}
	}, [selectedTab, getMemberRequest]);

	return (
		<OrganizationSettingsLayout
			title={t('organization.settings.members.title')}
			description={t('organization.settings.members.description')}
		>
			{canClusterSendEmail && (
				<>
					<InviteMemberForm
						submitForm={onSubmit}
						roles={orgRoles}
						title={t('organization.settings.members.invite.title') as string}
						description={t('organization.settings.members.invite.desc') as string}
						actions={
							<Button variant='primary' size='lg' disabled={!canInvite}>
								{t('organization.settings.members.invite.button')}
							</Button>
						}
						disabled={!canInvite}
					/>
					<Separator className='my-12' />
				</>
			)}

			<div className='members'>
				<Tabs
					defaultValue={selectedTab}
					onValueChange={(value) => {
						useOrganizationStore.setState?.({ selectedTab: value as 'member' | 'invitation' });
						clearFilter();
					}}
					className='relative'
				>
					<TabsList containerClassName='absolute -top-6 xs:relative'>
						<TabsTrigger value='member'>{t('organization.settings.members.title')}</TabsTrigger>
						<TabsTrigger value='invitation'>
							{t('organization.settings.pending-invitation')}
						</TabsTrigger>
					</TabsList>

					<TabsContent value='member'>
						<OrganizationMembersTable />
					</TabsContent>
					<TabsContent value='invitation'>
						<OrganizationInvitationTable />
					</TabsContent>
				</Tabs>
			</div>
		</OrganizationSettingsLayout>
	);
}
