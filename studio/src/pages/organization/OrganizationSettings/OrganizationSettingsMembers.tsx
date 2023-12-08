import { Form } from '@/components/Form';
import { InviteMemberForm, InviteMemberSchema } from '@/components/InviteMemberForm';
import { Separator } from '@/components/Separator';
import { OrganizationInvitationTable, OrganizationMembersTable } from '@/features/organization';
import { useToast, useUpdateEffect } from '@/hooks';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import useClusterStore from '@/store/cluster/clusterStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import '../organization.scss';
export default function OrganizationSettingsMembers() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { canClusterSendEmail } = useClusterStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const canInvite = useAuthorizeOrg('invite.create');
	const { inviteUsersToOrganization, getOrganizationMembers, organization } =
		useOrganizationStore();
	const form = useForm<z.infer<typeof InviteMemberSchema>>({
		resolver: zodResolver(InviteMemberSchema),
	});
	const { mutateAsync: inviteMutate, isPending } = useMutation({
		mutationFn: inviteUsersToOrganization,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('general.invitation.success'),
				type: 'success',
			});
			form.reset();
		},
		onError: (err: APIError) => {
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
			organizationId: organization?._id as string,
			members: data.member.filter((item) => item.email !== '' && item.role !== '') as any,
			uiBaseURL: window.location.origin,
		});
	};

	const { refetch } = useQuery({
		queryKey: ['organizationMembers'],
		queryFn: () =>
			getOrganizationMembers({
				organizationId: organization?._id as string,
				search: searchParams.get('q') as string,
				sortBy: searchParams.get('s') as string,
				sortDir: searchParams.get('d') as string,
				roles: searchParams.get('r')?.split(',') as string[],
			}),
		enabled: searchParams.get('tab') === 'member',
	});

	useUpdateEffect(() => {
		if (searchParams.get('tab') === 'member') refetch();
	}, [searchParams, searchParams.get('tab')]);

	useEffect(() => {
		if (!searchParams.has('tab')) {
			searchParams.set('tab', 'member');
			setSearchParams(searchParams);
		}
	}, []);

	return (
		<OrganizationSettingsLayout
			title={t('organization.settings.members.title')}
			description={t('organization.settings.members.description')}
		>
			{canClusterSendEmail && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<InviteMemberForm
							loading={isPending}
							type='org'
							title={t('organization.settings.members.invite.title') as string}
							description={t('organization.settings.members.invite.desc') as string}
							disabled={!canInvite}
						/>
						<Separator className='my-12' />
					</form>
				</Form>
			)}

			<div className='members'>
				<Tabs
					value={searchParams.get('tab') as string}
					onValueChange={(value) => {
						searchParams.set('tab', value);
						searchParams.delete('q');
						searchParams.delete('s');
						searchParams.delete('d');
						searchParams.delete('r');
						setSearchParams(searchParams);
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
