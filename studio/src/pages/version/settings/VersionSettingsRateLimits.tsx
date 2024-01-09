import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { EditRateLimit } from '@/features/version/SettingsGeneral';
import { RateLimitsColumns } from '@/features/version/SettingsRateLimits';
import RateLimitsActions from '@/features/version/SettingsRateLimits/RateLimitsActions.tsx';
import { useSearch, useTable } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore';
import { RateLimit } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsRateLimits() {
	const { t } = useTranslation();
	const limits = useVersionStore((state) => state.version?.limits ?? []);
	const { editRateLimitDrawerIsOpen, setEditRateLimitDrawerIsOpen } = useSettingsStore();
	const sortedLimits = useSearch(limits);

	const table = useTable({
		data: sortedLimits,
		columns: RateLimitsColumns,
	});

	return (
		<SettingsContainer
			action={<RateLimitsActions table={table} />}
			pageTitle={t('version.settings.rate_limits')}
			className='table-view'
		>
			{limits.length === 0 ? (
				<div className='h-full flex items-center justify-center'>
					<EmptyState type='rate-limit' title={t('version.no_rate_limiters')} />
				</div>
			) : (
				<div className='data-table-container'>
					<DataTable<RateLimit>
						table={table}
						className='version-settings-table table-fixed'
						containerClassName='version-settings-table-container'
					/>
				</div>
			)}
			<EditRateLimit open={editRateLimitDrawerIsOpen} onOpenChange={setEditRateLimitDrawerIsOpen} />
		</SettingsContainer>
	);
}
