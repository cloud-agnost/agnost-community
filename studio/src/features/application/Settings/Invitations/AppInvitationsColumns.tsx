import { Checkbox } from '@/components/Checkbox';
import { DateText } from '@/components/DateText';
import { ResendButton } from '@/components/ResendButton';
import { TableConfirmation } from '@/components/Table';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import { AppRoles, Invitation } from '@/types';
import { notify, translate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { RoleSelect } from 'components/RoleDropdown';

const role = useApplicationStore.getState()?.role;

function updateInvitationUserRole(token: string, role: string) {
	useApplicationStore.getState?.().updateInvitationUserRole({
		token,
		role,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.update', { role }),
				type: 'success',
			});
		},
		onError: ({ error, details }) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
}
function resendInvitation(token: string, email: string) {
	useApplicationStore.getState?.().resendInvitation({
		token,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.resent_success', {
					email,
				}),
				type: 'success',
			});
		},
		onError: ({ error, details }) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
}

function deleteInvitation(token: string) {
	useApplicationStore.getState?.().deleteInvitation({
		token,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.delete'),
				type: 'success',
			});
		},
		onError: ({ error, details }) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
}
export const AppInvitationsColumns: ColumnDef<Invitation>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'email',
		header: 'Email',
		accessorKey: 'email',
	},
	{
		id: 'invitedAt',
		header: 'Invited At',
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => <DateText date={row.original.createdAt} />,
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		cell: ({ row }) => {
			const { token, role } = row.original;
			return <UpdateInvitationUserRole token={token} invitationRole={role as AppRoles} />;
		},
	},
	{
		id: 'actions',
		size: 20,
		cell: ({ row }) => {
			const { token, email } = row.original;
			return (
				<div className='flex items-center justify-end'>
					<Resend token={token} email={email} />
					<TableConfirm token={token} />
				</div>
			);
		},
	},
];

function UpdateInvitationUserRole({
	token,
	invitationRole,
}: {
	token: string;
	invitationRole: AppRoles;
}) {
	const canUpdate = useAuthorizeApp({ role, key: 'invite.update' });
	return (
		<RoleSelect
			role={invitationRole}
			type={'app'}
			onSelect={(newRole) => updateInvitationUserRole(token, newRole)}
			disabled={!canUpdate}
		/>
	);
}

function Resend({ token, email }: { token: string; email: string }) {
	const hasAppPermission = useAuthorizeApp({
		key: 'invite.resend',
		role,
	});
	return (
		<ResendButton disabled={!hasAppPermission} onResend={() => resendInvitation(token, email)} />
	);
}

function TableConfirm({ token }: { token: string }) {
	const hasAppPermission = useAuthorizeApp({
		key: 'invite.delete',
		role,
	});
	return (
		<TableConfirmation
			title={translate('organization.settings.members.invite.delete')}
			description={translate('organization.settings.members.invite.deleteDesc')}
			onConfirm={() => deleteInvitation(token)}
			disabled={!hasAppPermission}
		/>
	);
}
