import { Button } from '@/components/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import useApplicationStore from '@/store/app/applicationStore';
import useTypeStore from '@/store/types/typeStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/Alert';
import { APIError } from '@/types';
import { useToast } from '@/hooks';

export default function AppInviteMember() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { isInviteMemberOpen, closeInviteMemberDrawer, inviteUsersToApp } = useApplicationStore();
	const { appRoles } = useTypeStore();
	const { notify } = useToast();
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
					<div>
						<h2 className='text-default text-sm font-semibold font-sfCompact'>
							{t('application.invite_member.subTitle')}
						</h2>
						<p className='text-sm text-subtle font-sfCompact'>
							{t('application.invite_member.description')}
						</p>
					</div>
					<InviteMemberForm
						roles={appRoles}
						submitForm={(val) => {
							inviteUsersToApp({
								members: val.map((m: { email: string; role: string }[]) => ({
									...m,
									uiBaseURL: window.location.origin,
								})),
								uiBaseUrl: window.location.origin,
								onSuccess: () => {
									setLoading(false);
									closeInviteMemberDrawer();
									notify({
										title: t('general.success'),
										description: t('general.invitation_success'),
										type: 'success',
									});
								},
								onError: (err) => {
									setLoading(false);
									setError(err);
								},
							});
						}}
						actions={
							<Button variant='primary' loading={loading}>
								{t('application.edit.invite')}
							</Button>
						}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
