import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { EditRateLimit } from '@/features/version/SettingsGeneral';
import { RateLimitsColumns } from '@/features/version/SettingsRateLimits';
import RateLimitsActions from '@/features/version/SettingsRateLimits/RateLimitsActions.tsx';
import { useTable } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore';
import { RateLimit } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsRateLimits() {
	const { t } = useTranslation();
	const limits = useVersionStore((state) => state.version?.limits ?? []);
	const { editRateLimitDrawerIsOpen, setEditRateLimitDrawerIsOpen } = useSettingsStore();

	const table = useTable({
		data: limits,
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
					<DataTable<RateLimit> table={table} className='table-fixed navigator' />
				</div>
			)}
			<EditRateLimit open={editRateLimitDrawerIsOpen} onOpenChange={setEditRateLimitDrawerIsOpen} />
		</SettingsContainer>
	);
}
