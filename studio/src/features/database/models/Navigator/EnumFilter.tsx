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
import { CaretDown } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface EnumFilterProps extends FilterProps {
	options: string[];
}
export default function EnumFilter({ columnName, options, type }: EnumFilterProps) {
	const { t } = useTranslation();
	const { setColumnFilters, clearColumnFilter } = useUtilsStore();
	const { selectedFilter, filterType } = useColumnFilter(columnName, type);
	const values = useMemo(
		() => (selectedFilter?.conditions[0].filter ?? []) as string[],
		[selectedFilter],
	);
	function onFilterChange(filter: string, checked: boolean) {
		const selectedValues = checked ? [...values, filter] : values.filter((v) => v !== filter);

		if (selectedValues.length === 0) {
			clearColumnFilter(columnName);
			return;
		} else {
			setColumnFilters(columnName, {
				filterType,
				conditions: [
					{
						type: ConditionsType.Includes,
						filter: selectedValues,
					},
				],
			});
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className='w-full'>
				<Button variant='secondary' className='gap-2' size='full'>
					{values?.length > 0
						? t('general.selected', {
								count: values.length,
							})
						: t('general.filter')}

					<CaretDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-full'>
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option}
						checked={values.includes(option)}
						onCheckedChange={(checked) => onFilterChange(option, checked)}
					>
						{option}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
