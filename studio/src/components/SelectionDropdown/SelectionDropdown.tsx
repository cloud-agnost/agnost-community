import { Button } from '@/components/Button';
import { Application, Organization } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check } from '@phosphor-icons/react';
import { MouseEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuTrigger,
} from '../Dropdown';
import { SearchInput } from '../SearchInput';
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
		<DropdownMenu>
			<div className='w-[210px] h-10 relative rounded-sm overflow-hidden flex items-center'>
				<SelectionLabel onClick={onClick} selectedData={selectedData} />
				<DropdownMenuTrigger asChild>
					<Button
						variant='icon'
						className='absolute z-50 top-1 right-0 text-icon-base p-1.5'
						rounded
						size='sm'
					>
						<CaretUpDown size={20} />
					</Button>
				</DropdownMenuTrigger>
			</div>

			<DropdownMenuContent align='end' className='min-w-[210px]'>
				{data.length > 5 && (
					<div className='p-2'>
						<SearchInput
							placeholder={t('organization.select') as string}
							value={search}
							canAddParam={false}
							onClear={() => setSearch('')}
							onSearch={(value) => setSearch(value)}
						/>
					</div>
				)}
				<DropdownMenuItemContainer>
					{filteredData.map((d) => (
						<DropdownMenuItem key={d._id} onClick={() => onSelect(d)}>
							<SelectionLabel selectedData={d} />
							<Check
								size={16}
								className={cn(
									'text-icon-base',
									selectedData?._id === d?._id ? 'opacity-100 ' : 'opacity-0',
								)}
								weight='bold'
							/>
						</DropdownMenuItem>
					))}
					{children}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
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
