import { Button } from '@/components/Button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandSeparator,
} from '@/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { MouseEvent, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { CaretUpDown, Check } from '@phosphor-icons/react';
import { cn } from '@/utils';
import { useTranslation } from 'react-i18next';
import { Application, Organization } from '@/types';
interface SelectionLabelProps {
	selectedData: Organization | Application;
	onClick?: () => void;
}

interface SelectionDropdownProps {
	selectedData: Organization | Application;
	data: Organization[] | Application[];
	onSelect: (data: Organization | Application) => void;
	onClick: () => void;
	children: React.ReactNode;
}

export default function SelectionDropdown({
	selectedData,
	data,
	onSelect,
	onClick,
	children,
}: SelectionDropdownProps) {
	const [search, setSearch] = useState('');
	const { t } = useTranslation();
	const filteredData = useMemo(() => {
		if (!search) return data;
		return data.filter((d) => RegExp(new RegExp(search, 'i')).exec(d.name));
	}, [data, search]);
	return (
		<Popover>
			<div className='w-[210px] h-10 relative'>
				<SelectionLabel onClick={onClick} selectedData={selectedData} />
				<PopoverTrigger asChild>
					<Button variant='icon' size='sm' className='absolute z-50 top-0 -right-1' rounded>
						<CaretUpDown size={20} />
					</Button>
				</PopoverTrigger>
			</div>
			<PopoverContent align='end' className='p-0'>
				<Command shouldFilter={false}>
					{data.length > 5 && (
						<CommandInput
							placeholder={t('organization.select') as string}
							value={search}
							onValueChange={setSearch}
						/>
					)}
					<CommandEmpty>{t('organization.empty')}</CommandEmpty>
					<CommandGroup className='max-h-[300px] overflow-y-auto'>
						<div className='space-y-2'>
							{filteredData.map((d) => (
								<CommandItem key={d._id} value={d._id} onSelect={() => onSelect(d)}>
									<SelectionLabel selectedData={d} />
									<Check
										size={16}
										className={cn(
											'text-icon-base',
											selectedData?._id === d?._id ? 'opacity-100 ' : 'opacity-0',
										)}
										weight='bold'
									/>
								</CommandItem>
							))}
						</div>
					</CommandGroup>
					<CommandSeparator />
					{children && (
						<CommandGroup className='[&>.command-item]:rounded-none hover:bg-inherit'>
							{children}
						</CommandGroup>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function SelectionLabel({ selectedData, onClick }: SelectionLabelProps) {
	function openAppSettings(e: MouseEvent<HTMLButtonElement>) {
		if (onClick) {
			e.stopPropagation();
			onClick();
		}
	}

	return (
		<Button
			variant='blank'
			size='sm'
			className='flex items-center px-1.5 h-full w-full transition font-normal rounded-sm hover:bg-button-secondary-hover'
			onClick={openAppSettings}
		>
			<Avatar className='mr-2' size='xs' square>
				<AvatarImage src={selectedData?.pictureUrl} alt={selectedData?.name} />
				<AvatarFallback name={selectedData?.name} color={selectedData?.color as string} />
			</Avatar>
			<div className='text-left flex-1 font-sfCompact h-full flex flex-col justify-center'>
				<div className='text-xs leading-none text-default whitespace-nowrap truncate max-w-[80%]'>
					{selectedData?.name}
				</div>
				<div className='text-xs text-subtle'>{selectedData?.role}</div>
			</div>
		</Button>
	);
}