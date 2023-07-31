import './SettingsRateLimits.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { Row, Table } from '@tanstack/react-table';
import { RateLimit } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import { RateLimitsColumns } from '@/features/version/SettingsRateLimits';
import { EditOrAddEndpointRateLimiterDrawer } from '@/features/version/SettingsGeneral';
import { EmptyState } from 'components/EmptyState';

interface SettingsNPMPackagesProps {
	selectedRows: Row<RateLimit>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<RateLimit>[] | undefined>>;
	setTable: Dispatch<SetStateAction<Table<RateLimit> | undefined>>;
}

export default function SettingsRateLimits({
	setSelectedRows,
	setTable,
}: SettingsNPMPackagesProps) {
	const { t } = useTranslation();
	const limits = useVersionStore((state) => state.version?.limits ?? []);
	const { editRateLimitDrawerIsOpen, setEditRateLimitDrawerIsOpen } = useVersionStore();

	return (
		<>
			{limits.length === 0 ? (
				<div className='h-full flex items-center justify-center'>
					<EmptyState title={t('version.no_rate_limiters')} />
				</div>
			) : (
				<div className='data-table-container'>
					<DataTable<RateLimit>
						columns={RateLimitsColumns}
						data={limits}
						setTable={setTable}
						setSelectedRows={setSelectedRows}
						noDataMessage={<p className='text-xl'>{t('version.no_rate_limiters')}</p>}
					/>
				</div>
			)}
			<EditOrAddEndpointRateLimiterDrawer
				open={editRateLimitDrawerIsOpen}
				onOpenChange={setEditRateLimitDrawerIsOpen}
				editMode
			/>
		</>
	);
}
