import { DotsThreeVertical } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { APPLICATION_SETTINGS } from '@/constants';
import { Button } from '@/components/Button';
import { useState } from 'react';
export default function ApplicationSettings() {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='blank' iconOnly className='ml-auto'>
					<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
					<span className='sr-only'>Open popover</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80'>
				<div className=''>
					{APPLICATION_SETTINGS.map((setting) => (
						<Button
							variant='blank'
							key={setting.name}
							onClick={() => {
								setOpen(false);
							}}
							className='w-full justify-start'
						>
							<span className='text-sm text-default'>{setting.name}</span>
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
