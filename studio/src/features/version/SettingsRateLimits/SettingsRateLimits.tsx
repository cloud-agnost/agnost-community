import './SettingsRateLimits.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { Row } from '@tanstack/react-table';
import { RateLimit } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import { RateLimitsColumns } from '@/features/version/SettingsRateLimits';
import { EditOrAddEndpointRateLimiterDrawer } from '@/features/version/SettingsGeneral';

interface SettingsNPMPackagesProps {
	selectedRows: Row<RateLimit>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<RateLimit>[] | undefined>>;
}

export default function SettingsRateLimits({ setSelectedRows }: SettingsNPMPackagesProps) {
	const { t } = useTranslation();
	const limits = useVersionStore((state) => state.version?.limits ?? []);
	const { editRateLimitDrawerIsOpen, setEditRateLimitDrawerIsOpen } = useVersionStore();

	return (
		<>
			<div className='data-table-container'>
				<DataTable<RateLimit>
					columns={RateLimitsColumns}
					data={limits}
					setSelectedRows={setSelectedRows}
					noDataMessage={<p className='text-xl'>{t('version.no_rate_limiters')}</p>}
				/>
			</div>
			<EditOrAddEndpointRateLimiterDrawer
				open={editRateLimitDrawerIsOpen}
				onOpenChange={setEditRateLimitDrawerIsOpen}
				editMode
			/>
		</>
	);
}
