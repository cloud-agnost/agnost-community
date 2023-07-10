import './SettingsNPMPackages.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable, SortButton } from 'components/DataTable';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Checkbox } from 'components/Checkbox';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { translate } from '@/utils';
import { Button } from 'components/Button';
import { DateText } from 'components/DateText';
import { NPMPackage } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { Trash } from '@phosphor-icons/react';

interface SettingsNPMPackagesProps {
	selectedRows: Row<NPMPackage>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<NPMPackage>[] | undefined>>;
}

export default function SettingsNPMPackages({ setSelectedRows }: SettingsNPMPackagesProps) {
	const npmPackages = useVersionStore((state) => state.version?.npmPackages ?? []);

	return (
		<div className='data-table-container'>
			<DataTable<NPMPackage>
				columns={NPMPackagesColumns}
				data={npmPackages}
				setSelectedRows={setSelectedRows}
			/>
		</div>
	);
}

export const NPMPackagesColumns: ColumnDef<NPMPackage>[] = [
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
		size: 40,
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'version',
		header: translate('general.version').toUpperCase(),
		accessorKey: 'version',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton text={translate('general.created_at').toUpperCase()} column={column} />
		),
		accessorKey: 'created_at',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const isMe = useAuthStore.getState().user?._id === createdBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={createdAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'actions',
		size: 45,
		cell: () => {
			return (
				<div className='flex items-center justify-end'>
					<Button
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Trash />
					</Button>
				</div>
			);
		},
	},
];
