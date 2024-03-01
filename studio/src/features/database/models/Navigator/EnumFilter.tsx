import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { useColumnFilter } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { ConditionsType, FilterProps } from '@/types';
import { cn } from '@/utils';
import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EnumFilterProps extends FilterProps {
	options: string[];
}
export default function EnumFilter({ columnName, options, type }: EnumFilterProps) {
	const { t } = useTranslation();
	const { setColumnFilters, clearColumnFilter } = useUtilsStore();
	const { selectedFilter, filterType } = useColumnFilter(columnName, type);
	const [filter, setFilter] = useState(selectedFilter);

	function onFilterChange(newFilter: string, checked: boolean) {
		const conditions = (filter?.conditions?.[0]?.filter as string[]) ?? [];
		if (checked) {
			conditions.push(newFilter);
		} else {
			const index = conditions.indexOf(newFilter);
			conditions.splice(index, 1);
		}
		setFilter((prev) => ({
			...prev,
			filterType,
			conditions: [{ filter: conditions, type: ConditionsType.Includes }],
		}));
	}

	function applyFilter() {
		if ((filter?.conditions?.[0]?.filter as string[])?.length === 0) {
			clearColumnFilter(columnName);
			return;
		} else {
			setColumnFilters(columnName, filter);
		}
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	useEffect(() => {
		setFilter(selectedFilter);
	}, [selectedFilter]);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild className='w-full'>
					<Button
						variant='blank'
						className={cn(
							'select !bg-input-background w-full text-xs',
							(filter?.conditions?.[0]?.filter as string[])?.length > 0
								? 'text-default'
								: 'text-subtle',
						)}
						size='full'
					>
						{(filter?.conditions?.[0]?.filter as string[])?.length > 0
							? t('general.selected', {
									count: (filter?.conditions?.[0]?.filter as string[])?.length,
								})
							: t('general.chooseOne')}

						<CaretDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-full min-w-[200px]'>
					{options.map((option) => (
						<DropdownMenuCheckboxItem
							key={option}
							checked={(filter?.conditions?.[0]?.filter as string[])?.includes(option)}
							onCheckedChange={(checked) => onFilterChange(option, checked)}
						>
							{option}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{filter?.conditions[0]?.filter ? (
				<Button variant='primary' onClick={applyFilter} size='full'>
					Apply
				</Button>
			) : null}
		</>
	);
}
