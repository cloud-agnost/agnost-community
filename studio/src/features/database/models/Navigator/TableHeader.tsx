import { Button } from '@/components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { CellFilterMap } from '@/constants';
import { useColumnFilter } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { Field, FieldTypes } from '@/types';
import { cn } from '@/utils';
import { CaretUp, FunnelSimple } from '@phosphor-icons/react';
import { IHeaderParams } from 'ag-grid-community';
import _ from 'lodash';
import { useLocation, useSearchParams } from 'react-router-dom';
interface SortButtonProps extends IHeaderParams {
	className?: string;
	field?: Field;
	filterable: boolean;
}

export default function TableHeader({ className, field, filterable }: SortButtonProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { selectedFilter } = useColumnFilter(field?.name as string, field?.type as FieldTypes);
	const { updateCurrentTab } = useTabStore();
	const { version } = useVersionStore();
	const { pathname } = useLocation();
	const { clearColumnFilter } = useUtilsStore();
	const defaultDirection = 'asc';
	const handleSortClick = () => {
		const currentField = searchParams.get('f');
		const currentDirection = searchParams.get('d');
		let newDirection = defaultDirection;
		if (currentField === field?.name) {
			newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
		}

		searchParams.set('f', field?.name as string);
		searchParams.set('d', newDirection);
		setSearchParams(searchParams);
		if (version) {
			updateCurrentTab(version._id, {
				path: `${pathname}?${searchParams.toString()}`,
			});
		}
	};

	function getFilterComponent() {
		const Comp = CellFilterMap[field?.type as FieldTypes];
		if (Comp) {
			return (
				<Comp
					type={field?.type}
					columnName={field?.name}
					options={field?.enum?.selectList as string[]}
				/>
			);
		}
		return null;
	}

	return (
		<div className='flex items-center w-full h-full'>
			<Button
				variant='blank'
				onClick={handleSortClick}
				size='sm'
				className={cn('justify-start w-full h-full', className)}
			>
				<p className='truncate'>{field?.name}</p>
				{searchParams.get('f') === field?.name && (
					<div className='ml-2'>
						<CaretUp
							size={14}
							className={cn(
								'text-icon-base',
								searchParams.get('d') === 'desc' && 'rotate-180 text-icon-secondary',
							)}
						/>
					</div>
				)}
			</Button>

			{CellFilterMap[field?.type as FieldTypes] && filterable && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='icon'
							size='sm'
							rounded
							className={cn(
								!_.isNil(selectedFilter) &&
									'bg-button-primary/90 dark:bg-button-primary/70 hover:bg-brand-darker dark:hover:bg-button-primary !text-white dark:text-default',
							)}
						>
							<FunnelSimple size={14} />
						</Button>
					</PopoverTrigger>
					<PopoverContent align='center' className='p-2 bg-subtle min-w-[210px]'>
						<div className='space-y-4'>
							{!_.isNil(selectedFilter) && (
								<Button size='full' onClick={() => clearColumnFilter(field?.name as string)}>
									Clear Filter
								</Button>
							)}
							{getFilterComponent()}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
