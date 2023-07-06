import { Button } from 'components/Button';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import useVersionStore from '@/store/version/versionStore.ts';
import {
	AddEndpointRateLimiterDrawer,
	SortableRateLimits,
} from '@/features/version/SettingsGeneral';

export default function EndpointRateLimiters() {
	const { t } = useTranslation();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const [addRateLimiterDropDownIsOpen, setAddRateLimiterDropDownIsOpen] = useState(false);
	const [addRateLimitDrawerIsOpen, setAddRateLimitDrawerIsOpen] = useState(false);

	return (
		<>
			<div className='p-4 border rounded-lg flex flex-col gap-4'>
				<div className='flex justify-between items-center'>
					<span className='uppercase font-sfCompact text-subtle leading-6 text-sm font-normal'>
						{t('version.rate_limiters')}
					</span>
					<DropdownMenu
						open={addRateLimiterDropDownIsOpen}
						onOpenChange={setAddRateLimiterDropDownIsOpen}
					>
						<DropdownMenuTrigger asChild>
							<Button>{t('version.add_rate_limiter')}</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='version-dropdown-content'>
							<DropdownMenuItemContainer>
								<DropdownMenuItem
									onClick={() => setAddRateLimitDrawerIsOpen(true)}
									className='flex gap-[10px] text-blue-500 text-sm font-medium'
								>
									<Plus />
									<span>{t('version.add_new_limiter')}</span>
								</DropdownMenuItem>
								{rateLimits && rateLimits.length > 1 && <DropdownMenuSeparator />}

								{rateLimits?.map((limiter, index) => (
									<DropdownMenuItem key={index}>
										<div className='flex flex-col'>
											<span>{limiter.name}</span>
											<span className='font-sfCompact text-[11px] text-subtle leading-[21px]'>
												{t('version.limiter_detail', {
													rate: limiter.rate,
													duration: limiter.duration,
												})}
											</span>
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuItemContainer>
						</DropdownMenuContent>
					</DropdownMenu>
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
