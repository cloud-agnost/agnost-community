import { useTranslation } from 'react-i18next';
import { AddRateLimiterDropdown } from '@/features/version/SettingsGeneral';
import { SortableRealtimeRateLimits } from '@/features/version/SettingsRealtime';

export default function RealtimeRateLimits() {
	const { t } = useTranslation();
	return (
		<>
			<div className='p-4 border rounded-lg flex flex-col gap-4'>
				<div className='flex justify-between items-center'>
					<span className='uppercase font-sfCompact text-subtle leading-6 text-sm font-normal'>
						{t('version.rate_limiters')}
					</span>
					<AddRateLimiterDropdown type='realtime' hasToAddAsDefault='realtime' />
				</div>
				<SortableRealtimeRateLimits />
			</div>
		</>
	);
}
