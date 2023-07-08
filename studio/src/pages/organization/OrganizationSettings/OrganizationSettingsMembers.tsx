import { Button } from '@/components/Button';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import { Separator } from '@/components/Separator';
import { PAGE_SIZE } from '@/constants';
import {
	OrganizationInvitationTable,
	OrganizationMembersTable,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useToast, useUpdateEffect } from '@/hooks';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTypeStore from '@/store/types/typeStore';
import { APIError, OrgMemberRequest, OrgSettingsTabType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function OrganizationSettingsMembers() {
	const { t } = useTranslation();
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

	const { notify } = useToast();

	function onSubmit(data: OrgMemberRequest[], setError: (error: APIError) => void) {
		inviteUsersToOrganization({
			organizationId: organization?._id as string,
			members: data,
			uiBaseURL: window.location.origin,
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('general.invitation.success'),
					type: 'success',
				});
			},
			onError: (error) => setError(error),
		});
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
			getOrganizationInvitations(getMemberRequest);
		}
	}, [selectedTab, getMemberRequest]);

	return (
		<OrganizationSettingsLayout
			title={t('organization.settings.members.title')}
			description={t('organization.settings.members.description')}
		>
			<InviteMemberForm
				submitForm={onSubmit}
				roles={orgRoles}
				title={t('organization.settings.members.invite.title') as string}
				description={t('organization.settings.members.invite.desc') as string}
				actions={
					<Button variant='primary' size='lg'>
						{t('organization.settings.members.invite.button')}
					</Button>
				}
			/>
			<Separator className='my-12' />
			<div className='members'>
				<Tabs
					defaultValue={selectedTab}
					onValueChange={(value) => {
						useOrganizationStore.setState?.({ selectedTab: value as 'member' | 'invitation' });
						clearFilter();
					}}
				>
					<div className='members-header'>
						<TabsList>
							<TabsTrigger value='member'>{t('organization.settings.members.title')}</TabsTrigger>
							<TabsTrigger value='invitation'>
								{t('organization.settings.pending-invitation')}
							</TabsTrigger>
						</TabsList>
						<OrganizationMembersTableHeader />
					</div>
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
