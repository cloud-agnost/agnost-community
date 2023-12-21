import { Badge } from '@/components/Badge';
import { BADGE_COLOR_MAP } from '@/constants';
import { ClusterComponentReleaseInfo } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';

const ReleaseColumns: ColumnDef<ClusterComponentReleaseInfo>[] = [
	{
		id: 'module',
		accessorKey: 'module',
		size: 300,
		enableResizing: false,
		header: () => <span>{t('cluster.component')}</span>,
	},
	{
		id: 'status',
		accessorKey: 'status',
		header: () => <span>{t('cluster.status')}</span>,
		enableResizing: false,
		cell: ({ row }) => {
			const { status } = row.original;
			return <Badge variant={BADGE_COLOR_MAP[status.toUpperCase()]} text={status} />;
		},
	},
	{
		id: 'current',
		accessorKey: 'version',
		size: 100,
		enableResizing: false,
		header: () => <span>{t('cluster.current')}</span>,
	},
	{
		id: 'latest',
		accessorKey: 'latest',
		size: 100,
		enableResizing: false,
		header: () => <span>{t('cluster.latest')}</span>,
	},
];

export default ReleaseColumns;
