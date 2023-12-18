import { Checkbox } from '@/components/Checkbox';
import { DateText } from '@/components/DateText';
import { ResendButton } from '@/components/ResendButton';
import { TableConfirmation } from '@/components/Table';
import useApplicationStore from '@/store/app/applicationStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation } from '@/types';
import { getAppPermission, notify, translate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { RoleSelect } from 'components/RoleDropdown';

const { updateInvitationUserRole, resendInvitation, deleteInvitation } =
	useApplicationStore.getState();

function getPermission(type: string) {
	return getAppPermission(`invite.${type}`);
}
function updateInvitationUserRoleHandler(token: string, role: string) {
	const orgId = useOrganizationStore.getState().organization._id;
	const appId = useApplicationStore.getState().application?._id as string;
	updateInvitationUserRole({
		orgId,
		appId,
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
function resendInvitationHandler(token: string, email: string) {
	const orgId = useOrganizationStore.getState().organization._id;
	const appId = useApplicationStore.getState().application?._id as string;
	resendInvitation({
		token,
		appId,
		orgId,
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

async function deleteInvitationHandler(token: string) {
	const orgId = useOrganizationStore.getState().organization._id;
	const appId = useApplicationStore.getState().application?._id as string;
	deleteInvitation({
		token,
		appId,
		orgId,
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

			return (
				<RoleSelect
					role={role}
					type={'app'}
					onSelect={(newRole) => updateInvitationUserRoleHandler(token, newRole)}
					disabled={!getPermission('update')}
				/>
			);
		},
	},
	{
		id: 'actions',
		size: 20,
		cell: ({ row }) => {
			const { token, email } = row.original;
			return (
				<div className='flex items-center justify-end'>
					<ResendButton
						disabled={!getPermission('update')}
						onResend={() => resendInvitationHandler(token, email)}
					/>
					<TableConfirmation
						title={translate('application.invite_member.delete')}
						description={translate('application.invite_member.deleteDesc')}
						onConfirm={() => deleteInvitationHandler(token)}
						hasPermission={getPermission('delete')}
					/>
				</div>
			);
		},
	},
];
