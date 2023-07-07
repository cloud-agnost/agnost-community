import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
	AddEndpointRateLimiterDrawer,
	AddRateLimiterDropdown,
	SortableRateLimits,
} from '@/features/version/SettingsGeneral';

export default function EndpointRateLimiters() {
	const { t } = useTranslation();
	const [addRateLimiterDropDownIsOpen, setAddRateLimiterDropDownIsOpen] = useState(false);
	const [addRateLimitDrawerIsOpen, setAddRateLimitDrawerIsOpen] = useState(false);

	return (
		<>
			<div className='p-4 border rounded-lg flex flex-col gap-4'>
				<div className='flex justify-between items-center'>
					<span className='uppercase font-sfCompact text-subtle leading-6 text-sm font-normal'>
						{t('version.rate_limiters')}
					</span>
					<AddRateLimiterDropdown
						open={addRateLimiterDropDownIsOpen}
						onOpenChange={setAddRateLimiterDropDownIsOpen}
					/>
				</div>
				<SortableRateLimits />
			</div>
			{/* The key for reset the state of the component */}
			<AddEndpointRateLimiterDrawer
				key={addRateLimitDrawerIsOpen.toString()}
				open={addRateLimitDrawerIsOpen}
				onOpenChange={setAddRateLimitDrawerIsOpen}
			/>
		</>
	);
}
