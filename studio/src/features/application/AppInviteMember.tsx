import { Button } from '@/components/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import useApplicationStore from '@/store/app/applicationStore';
import useTypeStore from '@/store/types/typeStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/Alert';
import { APIError, AppMemberRequest } from '@/types';
import { useToast } from '@/hooks';
import useClusterStore from '@/store/cluster/clusterStore';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';

export default function AppInviteMember() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error] = useState<APIError>();
	const { isInviteMemberOpen, closeInviteMemberDrawer, inviteUsersToApp } = useApplicationStore();
	const { appRoles } = useTypeStore();
	const { notify } = useToast();
	const { canClusterSendEmail } = useClusterStore();
	const canInvite = useAuthorizeOrg('invite.create');
	function onSubmit(members: AppMemberRequest[], setError: (error: APIError) => void) {
		inviteUsersToApp({
			members: members.map((member) => ({
				...member,
				uiBaseURL: window.location.origin,
			})),
			uiBaseURL: window.location.origin,
			onSuccess: () => {
				setLoading(false);
				closeInviteMemberDrawer();
				notify({
					title: t('general.success'),
					description: t('general.invitation.success'),
					type: 'success',
				});
			},
			onError: (err) => {
				setLoading(false);
				setError(err);
			},
		});
	}
	return (
		<Drawer open={isInviteMemberOpen} onOpenChange={closeInviteMemberDrawer}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('application.invite_member.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					{error && (
						<Alert variant='error'>
							<AlertTitle>{error.error}</AlertTitle>
							<AlertDescription>{error.details}</AlertDescription>
						</Alert>
					)}

					{canClusterSendEmail && (
						<InviteMemberForm
							submitForm={onSubmit}
							roles={appRoles}
							title={t('application.invite_member.subTitle') as string}
							description={t('application.invite_member.description') as string}
							actions={
								<Button variant='primary' loading={loading}>
									{t('application.edit.invite')}
								</Button>
							}
							disabled={!canInvite}
						/>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
