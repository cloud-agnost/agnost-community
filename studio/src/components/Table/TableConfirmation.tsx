import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { X } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '../Avatar';
import { Button } from '../Button';
interface TableConfirmationProps {
	children: React.ReactNode;
	onConfirm: () => void;
	title: string;
	description: string;
}

export function TableConfirmation({
	children,
	onConfirm,
	title,
	description,
}: TableConfirmationProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>{children}</PopoverTrigger>
			<PopoverContent className='mr-2'>
				<div id='popup-modal' tabIndex={-1}>
					<div className='relative w-full max-w-sm max-h-full'>
						<Button
							variant='blank'
							className='absolute top-3 right-2.5 text-icon-base hover:text-icon-secondary rounded-full'
							data-modal-hide='popup-modal'
							onClick={() => setOpen(false)}
						>
							<X size={20} />
							<span className='sr-only'>Close modal</span>
						</Button>
						<div className='relative rounded p-4'>
							<div className='flex flex-col justify-center items-center space-y-4 text-center'>
								<Avatar size='3xl'>
									<AvatarFallback color='#9B7B0866' />
								</Avatar>
								<h3 className='text-lg font-semibold text-default'>{title}</h3>
								<p className='text-sm font-normal text-subtle'>{description}</p>
							</div>
							<div className='flex  items-center justify-center gap-4 mt-8'>
								<Button variant='text' size='lg' onClick={() => setOpen(false)}>
									{t('general.cancel')}
								</Button>
								<Button variant='primary' size='lg' onClick={onConfirm}>
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
