import { Button } from '@/components/Button';
import { Command, CommandGroup, CommandItem, CommandSeparator } from '@/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { APPLICATION_SETTINGS } from '@/constants';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
export default function ApplicationSettings() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='blank' iconOnly className='p-0'>
					<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
					<span className='sr-only'>Open popover</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[181px]'>
				<Command>
					<CommandGroup>
						{APPLICATION_SETTINGS.map((setting) => (
							<CommandItem
								key={setting.name}
								onSelect={() => {
									setOpen(false);
								}}
								className='font-sfCompact px-3'
							>
								{setting.name}
							</CommandItem>
						))}
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup>
						<CommandItem
							onSelect={() => {
								setOpen(false);
							}}
							className='font-sfCompact px-3'
						>
							{t('application.settings.leaveTeam')}
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup>
						<CommandItem
							onSelect={() => {
								setOpen(false);
							}}
							className='font-sfCompact px-3'
						>
							{t('general.delete')}
						</CommandItem>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
