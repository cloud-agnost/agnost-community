import { Button } from 'components/Button';
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError, RateLimit } from '@/types';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import { useState } from 'react';
import { EditOrAddEndpointRateLimiterDrawer } from '@/features/version/SettingsGeneral';

interface AddRateLimiterDropdownProps {
	options: RateLimit[] | undefined;
	onSelect: (limiter: RateLimit) => void;
	hasToAddAsDefault?: 'endpoint' | 'realtime';
}

export default function AddRateLimiterDropdown({
	options,
	onSelect,
	hasToAddAsDefault,
}: AddRateLimiterDropdownProps) {
	const [addRateLimiterDropDownIsOpen, setAddRateLimiterDropDownIsOpen] = useState(false);
	const [addRateLimitDrawerIsOpen, setAddRateLimitDrawerIsOpen] = useState(false);
	const { t } = useTranslation();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();

	async function addToDefault(limiter: RateLimit) {
		if (!defaultLimits || !versionId || !appId || !orgId) return;
		try {
			await updateVersionProperties({
				orgId,
				versionId,
				appId,
				defaultEndpointLimits: [...(defaultLimits ?? []), limiter.iid],
			});
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.limiter_added_to_default'),
			});
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		}
	}

	return (
		<>
			<DropdownMenu
				open={addRateLimiterDropDownIsOpen}
				onOpenChange={setAddRateLimiterDropDownIsOpen}
			>
				<DropdownMenuTrigger asChild>
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

				<DropdownMenuContent align='end' className='version-dropdown-content'>
					<DropdownMenuItemContainer>
						<DropdownMenuItem
							onClick={() => setAddRateLimitDrawerIsOpen(true)}
							className='flex gap-[10px] text-blue-500 text-sm font-medium'
						>
							<Plus weight='bold' />
							<span>{t('version.add_new_limiter')}</span>
						</DropdownMenuItem>
						{rateLimitsNotInDefault && rateLimitsNotInDefault.length > 1 && (
							<DropdownMenuSeparator />
						)}

						{rateLimitsNotInDefault?.map((limiter, index) => (
							<DropdownMenuItem onClick={() => addToDefault(limiter)} key={index}>
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
			<EditOrAddEndpointRateLimiterDrawer
				addToDefault={hasToAddAsDefault}
				onCreate={onSelect}
				key={addRateLimitDrawerIsOpen.toString()}
				open={addRateLimitDrawerIsOpen}
				onOpenChange={setAddRateLimitDrawerIsOpen}
			/>
		</>
	);
}
