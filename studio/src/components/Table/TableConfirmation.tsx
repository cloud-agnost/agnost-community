import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { cn } from '@/utils';
import { Trash, X } from '@phosphor-icons/react';
import { Align } from '@radix-ui/react-popper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '../Avatar';
import { Button } from '../Button';
interface TableConfirmationProps {
	onConfirm: () => void;
	title: string;
	showAvatar?: boolean;
	description: string;
	align?: Align;
	contentClassName?: string;
	closeOnConfirm?: boolean;
	authorizedKey?: string;
}

export function TableConfirmation({
	onConfirm,
	authorizedKey,
	showAvatar = true,
	title,
	description,
	contentClassName,
	closeOnConfirm,
	align = 'center',
}: TableConfirmationProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	function confirm() {
		onConfirm();
		if (closeOnConfirm) setOpen(false);
	}
	const hasVersionPermission = useAuthorizeVersion(authorizedKey as string);
	const hasOrgPermission = useAuthorizeOrg(authorizedKey as string);
	// const appDisabled = useAuthorizeApp(authorizedKey as string);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={!hasVersionPermission || !hasOrgPermission}
					variant='blank'
					rounded
					className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
					iconOnly
				>
					<Trash size={20} />
				</Button>
			</PopoverTrigger>
			<PopoverContent align={align} className={cn('mr-2', contentClassName)}>
				<div id='popup-modal' tabIndex={-1}>
					<div className='relative w-full max-w-sm max-h-full'>
						<Button
							variant='blank'
							className='absolute top-3 z-10 right-2.5 text-icon-base hover:text-icon-secondary rounded-full'
							data-modal-hide='popup-modal'
							onClick={() => setOpen(false)}
						>
							<X size={20} />
							<span className='sr-only'>Close modal</span>
						</Button>
						<div className='relative rounded p-4'>
							<div className='flex flex-col justify-center items-center space-y-4 text-center'>
								{showAvatar && (
									<Avatar size='3xl'>
										<AvatarFallback color='#9B7B0866' />
									</Avatar>
								)}
								<h3 className='text-lg font-semibold text-default'>{title}</h3>
								<p className='text-sm font-normal text-subtle'>{description}</p>
							</div>
							<div className='flex items-center justify-center gap-4 mt-8'>
								<Button variant='text' size='lg' onClick={() => setOpen(false)}>
									{t('general.cancel')}
								</Button>
								<Button variant='primary' size='lg' onClick={confirm}>
									{t('general.ok')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
