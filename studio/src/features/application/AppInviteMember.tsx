import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { InviteMemberForm, InviteMemberSchema } from '@/components/InviteMemberForm';
import { useToast } from '@/hooks';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useApplicationStore from '@/store/app/applicationStore';
import useClusterStore from '@/store/cluster/clusterStore';
import { APIError } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

export default function AppInviteMember() {
	const { t } = useTranslation();

	const { isInviteMemberOpen, closeInviteMemberDrawer, inviteUsersToApp } = useApplicationStore();
	const { notify } = useToast();
	const { canClusterSendEmail } = useClusterStore();
	const canInvite = useAuthorizeOrg('invite.create');
	console.log('canInvite', canInvite);
	const form = useForm<z.infer<typeof InviteMemberSchema>>({
		resolver: zodResolver(InviteMemberSchema),
	});
	const { mutateAsync: inviteMutate, isPending } = useMutation({
		mutationFn: inviteUsersToApp,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('general.invitation.success'),
				type: 'success',
			});
			handleCloseDrawer();
		},
		onError: (err: APIError) => {
			console.log(err);
			err.fields?.forEach((field) => {
				form.setError(`member.${field.param.replace(/\[|\]/g, '')}` as any, {
					type: 'custom',
					message: field.msg,
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
