import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { RateLimit } from '@/types';
import { useTranslation } from 'react-i18next';
import { SettingsRateLimits } from '@/features/version/SettingsRateLimits';
import RateLimitsActions from '@/features/version/SettingsRateLimits/RateLimitsActions.tsx';

export default function VersionSettingsRateLimits() {
	const [selectedRows, setSelectedRows] = useState<Row<RateLimit>[]>();
	const [table, setTable] = useState<Table<RateLimit>>();
	const { t } = useTranslation();

	return (
		<SettingsContainer
			action={
				<RateLimitsActions
					setSelectedRows={setSelectedRows}
					table={table}
					selectedRows={selectedRows}
				/>
			}
			pageTitle={t('version.settings.rate_limits')}
			className='table-view'
		>
			<SettingsRateLimits
				setTable={setTable}
				selectedRows={selectedRows}
				setSelectedRows={setSelectedRows}
			/>
		</SettingsContainer>
	);
}
