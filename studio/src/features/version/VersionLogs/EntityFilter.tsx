import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useTaskStore from '@/store/task/taskStore';
import useUtilsStore from '@/store/version/utilsStore';
import { ColumnFilterType, ConditionsType, FieldTypes, Filters } from '@/types';
import { cn } from '@/utils';
import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import FilterLayout from './FilterLayout';
import { useColumnFilter } from '@/hooks';

export default function EntityFilter() {
	const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
	const { pathname } = useLocation();
	const logType = pathname.split('/')[7];
	const { selectedFilter } = useColumnFilter(logType, 'name', FieldTypes.TEXT);
	const { queues, getQueues } = useMessageQueueStore();
	const { endpoints, getEndpoints } = useEndpointStore();
	const { tasks, getTasks } = useTaskStore();
	const { t } = useTranslation();
	const { versionId, appId, orgId } = useParams() as Record<string, string>;
	const { setColumnFilters } = useUtilsStore();
	const options = useMemo(() => {
		switch (logType) {
			case 'queue':
				if (!queues.length)
					getQueues({
						orgId,
						appId,
						versionId,
						page: 0,
						size: 250,
					});
				return queues.map((queue) => queue.name);
			case 'endpoint':
				if (!endpoints.length)
					getEndpoints({
						orgId,
						appId,
						versionId,
						page: 0,
						size: 250,
					});
				return endpoints.map((endpoint) => endpoint.name);
			case 'task':
				if (!tasks.length)
					getTasks({
						orgId,
						appId,
						versionId,
						page: 0,
						size: 250,
					});
				return tasks.map((task) => task.name);
			default:
				return [];
		}
	}, [queues, endpoints, tasks, pathname]);

	function applyFilter() {
		const filter: ColumnFilterType = {
			conditions: [
				{
					filter: selectedEntities,
					type: ConditionsType.Includes,
				},
			],
			filterType: Filters.Text,
		};
		setColumnFilters('name', filter, logType);
	}

	function onFilterChange(option: string, checked: boolean) {
		if (checked) {
			setSelectedEntities((prev) => [...prev, option]);
		} else {
			setSelectedEntities((prev) => prev.filter((item) => item !== option));
		}
	}

	function clearFilter() {
		setSelectedEntities([]);
	}

	useEffect(() => {
		const conditions = selectedFilter?.conditions;
		if (!conditions?.length) return;
		setSelectedEntities(conditions[0].filter as string[]);
	}, [selectedFilter]);

	return (
		<FilterLayout onApply={applyFilter} onClear={clearFilter} columnName='name'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='blank'
						className={cn(
							'select !bg-input-background w-full text-xs',
							selectedEntities?.length > 0 ? 'text-default' : 'text-subtle',
						)}
						size='full'
					>
						{selectedEntities?.length > 0
							? t('general.selected', {
									count: selectedEntities?.length,
								})
							: t('general.chooseOne')}

						<CaretDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start' className='overflow-auto h-72 w-[200px]'>
					{options.map((option) => (
						<DropdownMenuCheckboxItem
							key={option}
							checked={selectedEntities?.includes(option)}
							onCheckedChange={(checked) => onFilterChange(option, checked)}
						>
							{option}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</FilterLayout>
	);
}
