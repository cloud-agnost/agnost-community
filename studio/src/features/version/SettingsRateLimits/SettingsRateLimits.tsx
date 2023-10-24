import { EditOrAddEndpointRateLimiterDrawer } from '@/features/version/SettingsGeneral';
import { RateLimitsColumns } from '@/features/version/SettingsRateLimits';
import useVersionStore from '@/store/version/versionStore.ts';
import { RateLimit } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsRateLimits.scss';
import useSettingsStore from '@/store/version/settingsStore';

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
	const { editRateLimitDrawerIsOpen, setEditRateLimitDrawerIsOpen } = useSettingsStore();

	return (
		<>
			{limits.length === 0 ? (
				<div className='h-full flex items-center justify-center'>
					<EmptyState type='rate-limit' title={t('version.no_rate_limiters')} />
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
