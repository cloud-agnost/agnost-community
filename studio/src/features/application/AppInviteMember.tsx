import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { InviteMemberForm, InviteMemberSchema } from '@/components/InviteMemberForm';
import { useToast } from '@/hooks';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import { useParams } from 'react-router-dom';

export default function AppInviteMember() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error] = useState<APIError>();
	const { isInviteMemberOpen, application, closeInviteMemberDrawer, inviteUsersToApp } =
		useApplicationStore();
	const { appRoles } = useTypeStore();
	const { notify } = useToast();
	const { canClusterSendEmail } = useClusterStore();
	const canInvite = useAuthorizeOrg('invite.create');
	const { orgId } = useParams() as Record<string, string>;
	function onSubmit(members: AppMemberRequest[], setError: (error: APIError) => void) {
		inviteUsersToApp({
			members: members.map((member) => ({
				...member,
				uiBaseURL: window.location.origin,
			})),
			uiBaseURL: window.location.origin,
			orgId,
			appId: application?._id as string,
			onSuccess: () => {
				setLoading(false);
				closeInviteMemberDrawer();
				notify({
					title: t('general.success'),
					description: t('general.invitation.success'),
					type: 'success',
				});
			});
		},
	});

	const onSubmit = (data: z.infer<typeof InviteMemberSchema>) => {
		inviteMutate({
			members: data.member
				.filter((item) => item.email !== '' && item.role !== '')
				.map((member) => ({
					...member,
					uiBaseURL: window.location.origin,
				})),
			uiBaseURL: window.location.origin,
		});
	};

	function handleCloseDrawer() {
		form.reset({
			member: [{ email: '', role: '' }],
		});
		closeInviteMemberDrawer();
	}
	return (
		<Drawer open={isInviteMemberOpen} onOpenChange={handleCloseDrawer}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('application.invite_member.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					{canClusterSendEmail && (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<InviteMemberForm
									type='app'
									title={t('application.invite_member.subTitle') as string}
									description={t('application.invite_member.description') as string}
									loading={isPending}
									disabled={!canInvite}
								/>
							</form>
						</Form>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
