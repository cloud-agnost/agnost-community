import { useTranslation } from 'react-i18next';
import { AddRateLimiterDropdown } from '@/features/version/SettingsGeneral';
import { SortableRealtimeRateLimits } from '@/features/version/SettingsRealtime';
import useVersionStore from '@/store/version/versionStore';
import { useParams } from 'react-router-dom';
import { RateLimit } from '@/types';

export default function RealtimeRateLimits() {
	const { t } = useTranslation();
	const { updateVersionRealtimeProperties } = useVersionStore();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const realtimeEndpoints = useVersionStore((state) => state.version?.realtime?.rateLimits);

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	function addToDefault(limiter: RateLimit) {
		updateVersionRealtimeProperties({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			rateLimits: [...(realtimeEndpoints ?? []), limiter.iid],
		});
	}

	return (
		<>
			<div className='p-4 border rounded-lg flex flex-col gap-4'>
				<div className='flex justify-between items-center'>
					<span className='uppercase font-sfCompact text-subtle leading-6 text-sm font-normal'>
						{t('version.rate_limiters')}
					</span>
					<AddRateLimiterDropdown
						hasToAddAsDefault='realtime'
						options={rateLimits}
						onSelect={addToDefault}
					/>
				</div>
				<SortableRealtimeRateLimits />
			</div>
		</>
	);
}
