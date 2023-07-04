import { Button } from '@/components/Button';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import {
	OrganizationInvitationTable,
	OrganizationMembersTable,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useToast } from '@/hooks';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTypeStore from '@/store/types/typeStore';
import { APIError, OrgMemberRequest } from '@/types';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/Separator';
import { ORGANIZATION_MEMBERS_PAGE_SIZE } from '@/constants';
import { useMemo } from 'react';
interface OutletContextTypes {
	isMember: boolean;
	page: number;
}

export default function OrganizationSettingsMembers() {
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const {
		inviteUsersToOrganization,
		getOrganizationInvitations,
		getOrganizationMembers,
		organization,
	} = useOrganizationStore();

	const { notify } = useToast();

	function onSubmit(data: { member: OrgMemberRequest[] }, setError: (error: APIError) => void) {
		inviteUsersToOrganization({
			organizationId: organization?._id as string,
			members: data.member.filter((item) => item.email !== '' && item.role !== ''),
			uiBaseURL: window.location.origin,
			onSuccess: () => {
				notify({
					title: 'Success',
					description: 'success',
					type: 'success',
				});
			},
			onError: (error) => setError(error),
		});
	}

	const { orgRoles } = useTypeStore();

	const { isMember, page } = useOutletContext() as OutletContextTypes;

	const getMemberRequest = useMemo(
		() => ({
			page,
			size: ORGANIZATION_MEMBERS_PAGE_SIZE,
			organizationId: organization?._id as string,
			...(isMember
				? { search: searchParams.get('q') as string }
				: { email: searchParams.get('q') as string }),
			sortBy: searchParams.get('s') as string,
			sortDir: searchParams.get('d') as string,
			role: searchParams.get('r') as string,
		}),
		[searchParams, isMember, page],
	);

	useEffect(() => {
		if (isMember) {
			getOrganizationMembers(getMemberRequest);
		} else {
			getOrganizationInvitations(getMemberRequest);
		}
	}, [getMemberRequest]);

	return (
		<OrganizationSettingsLayout
			title={t('organization.settings.members.title')}
			description={t('organization.settings.members.description')}
		>
			<InviteMemberForm
				submitForm={onSubmit}
				roles={orgRoles}
				title={t('organization.settings.members.invite.title')}
				description={t('organization.settings.members.invite.desc')}
				actions={
					<Button variant='primary' size='lg'>
						Invite
					</Button>
				}
			/>
			<Separator className='my-12' />
			<div className='members'>
				<OrganizationMembersTableHeader />
				<div className='members-table'>
					{isMember ? <OrganizationMembersTable /> : <OrganizationInvitationTable />}
				</div>
			</div>
		</OrganizationSettingsLayout>
	);
}
