import { Button } from '@/components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { CellFilterMap } from '@/constants';
import { useColumnFilter } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { FieldTypes } from '@/types';
import { cn } from '@/utils';
import { CaretUp, FunnelSimple, X } from '@phosphor-icons/react';
import { IHeaderParams } from 'ag-grid-community';
import _ from 'lodash';
import { useLocation, useSearchParams } from 'react-router-dom';
interface SortButtonProps extends IHeaderParams {
	className?: string;
	field?: FieldTypes;
	text: string;
	filterable?: boolean;
	selectList?: string[];
}

export default function TableHeader({
	className,
	field,
	text,
	filterable,
	selectList,
}: SortButtonProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { selectedFilter } = useColumnFilter(text, field as FieldTypes);
	const { updateCurrentTab } = useTabStore();
	const { version } = useVersionStore();
	const { pathname } = useLocation();
	const { clearColumnFilter } = useUtilsStore();
	const defaultDirection = 'asc';
	const handleSortClick = () => {
		const currentField = searchParams.get('f');
		const currentDirection = searchParams.get('d');
		let newDirection = defaultDirection;
		if (currentField === field) {
			newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
		}

		searchParams.set('f', field as string);
		searchParams.set('d', newDirection);
		setSearchParams(searchParams);
		if (version) {
			updateCurrentTab(version._id, {
				path: `${pathname}?${searchParams.toString()}`,
			});
		}
	};

	function handleClearFilter() {
		clearColumnFilter(text);
		searchParams.set('page', '1');
		setSearchParams(searchParams);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	function getFilterComponent() {
		const Comp = CellFilterMap[field as FieldTypes];
		if (Comp) {
			return <Comp type={field} columnName={text} options={selectList as string[]} />;
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
				<p className='truncate'>{text}</p>
				{searchParams.get('f') === text && (
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

			{CellFilterMap[field as FieldTypes] && filterable && (
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
							{getFilterComponent()}
							{!_.isNil(selectedFilter) && (
								<Button
									size='full'
									onClick={handleClearFilter}
									variant='text'
									className='items-center'
								>
									<X size={14} className='mr-2' />
									Clear Filter
								</Button>
							)}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
