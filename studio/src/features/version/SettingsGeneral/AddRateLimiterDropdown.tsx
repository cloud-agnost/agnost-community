import { Button } from '@/components/Button';
import { CreateRateLimit } from '@/features/version/SettingsGeneral';
import { RateLimit } from '@/types';
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddRateLimiterDropdownProps {
	options: RateLimit[] | undefined;
	onSelect: (limiter: RateLimit) => void;
	hasToAddAsDefault?: 'endpoint' | 'realtime';
	disabled?: boolean;
}

export default function AddRateLimiterDropdown({
	options,
	onSelect,
	hasToAddAsDefault,
	disabled,
}: AddRateLimiterDropdownProps) {
	const [addRateLimiterDropDownIsOpen, setAddRateLimiterDropDownIsOpen] = useState(false);
	const [addRateLimitDrawerIsOpen, setAddRateLimitDrawerIsOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<>
			<DropdownMenu
				open={addRateLimiterDropDownIsOpen}
				onOpenChange={setAddRateLimiterDropDownIsOpen}
			>
				<DropdownMenuTrigger asChild disabled={disabled}>
					<Button variant='secondary' className='flex items-center gap-[10px]'>
						<Plus weight='bold' className='text-base' />
						{t('version.add_rate_limiter')}
						{addRateLimiterDropDownIsOpen ? (
							<CaretUp weight='bold' className='text-base' />
						) : (
							<CaretDown weight='bold' className='text-base' />
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end' className='version-dropdown-content bg-input-background'>
					<DropdownMenuItemContainer>
						<DropdownMenuItem
							onClick={() => setAddRateLimitDrawerIsOpen(true)}
							className='flex gap-[10px] text-xs font-medium'
						>
							<Plus weight='bold' size={14} />
							<span>{t('version.add_new_limiter')}</span>
						</DropdownMenuItem>
						{options && options.length > 1 && <DropdownMenuSeparator />}

						{options?.map((limiter, index) => (
							<DropdownMenuItem onClick={() => onSelect(limiter)} key={index}>
								<div className='flex flex-col'>
									<span className='text-xs'>{limiter.name}</span>
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
			<CreateRateLimit
				type={hasToAddAsDefault}
				onCreate={onSelect}
				key={addRateLimitDrawerIsOpen.toString()}
				open={addRateLimitDrawerIsOpen}
				onOpenChange={setAddRateLimitDrawerIsOpen}
			/>
		</>
	);
}
