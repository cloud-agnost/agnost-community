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

interface AddRateLimiterDropdownProps {
	open?: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddRateLimiterDropdown({
	open,
	onOpenChange,
}: AddRateLimiterDropdownProps) {
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const defaultLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
	const rateLimitsNotInDefault = rateLimits?.filter((item) => !defaultLimits?.includes(item.iid));
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
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button variant='secondary' className='flex items-center gap-[10px]'>
					<Plus weight='bold' className='text-base' />
					{t('version.add_rate_limiter')}
					{open ? (
						<CaretUp weight='bold' className='text-base' />
					) : (
						<CaretDown weight='bold' className='text-base' />
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='version-dropdown-content'>
				<DropdownMenuItemContainer>
					<DropdownMenuItem
						onClick={() => onOpenChange(true)}
						className='flex gap-[10px] text-blue-500 text-sm font-medium'
					>
						<Plus weight='bold' />
						<span>{t('version.add_new_limiter')}</span>
					</DropdownMenuItem>
					{rateLimitsNotInDefault && rateLimitsNotInDefault.length > 1 && <DropdownMenuSeparator />}

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
	);
}
