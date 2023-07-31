import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { X } from '@phosphor-icons/react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '../Avatar';
import { Button } from '../Button';
import { Align } from '@radix-ui/react-popper';
import { cn } from '@/utils';
interface TableConfirmationProps {
	children: ReactNode;
	onConfirm: () => void;
	title: string;
	showAvatar?: boolean;
	description: string;
	align?: Align;
	contentClassName?: string;
	closeOnConfirm?: boolean;
}

export function TableConfirmation({
	children,
	onConfirm,
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
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
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
