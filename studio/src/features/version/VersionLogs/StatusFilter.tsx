import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { useColumnFilter } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { ColumnFilterType, ConditionsType, FieldTypes, Filters } from '@/types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilterLayout from './FilterLayout';
export default function StatusFilter() {
	const [status, setStatus] = useState<'Success' | 'Error'>('Success');
	const { pathname } = useLocation();
	const logType = pathname.split('/')[7];
	const { selectedFilter } = useColumnFilter(logType, 'status', FieldTypes.TEXT);
	const { setColumnFilters } = useUtilsStore();

	function applyFilter() {
		const filter: ColumnFilterType = {
			conditions: [
				{
					filter: 200,
					type: status === 'Success' ? ConditionsType.Equals : ConditionsType.NotEquals,
				},
			],
			filterType: Filters.Text,
		};
		setColumnFilters('status', filter, logType);
	}

	useEffect(() => {
		if (!selectedFilter) return;
		const conditions = selectedFilter?.conditions;

		setStatus(conditions[0].type === ConditionsType.Equals ? 'Success' : 'Error');
	}, [selectedFilter]);

	return (
		<FilterLayout onApply={applyFilter} columnName='status'>
			<Select
				defaultValue={status}
				onValueChange={(value) => setStatus(value as 'Success' | 'Error')}
			>
				<SelectTrigger className='w-full text-xs'>
					<SelectValue placeholder='Select Status'>{status}</SelectValue>
				</SelectTrigger>

				<SelectContent>
					{['Success', 'Error'].map((status) => (
						<SelectItem key={status} value={status} className='max-w-full text-xs'>
							{status}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterLayout>
	);
}
