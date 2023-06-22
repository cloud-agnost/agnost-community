import { cn } from '@/utils';
import { Column } from '@tanstack/react-table';
import { Button } from '../Button';
import { CaretUp, CaretDown } from '@phosphor-icons/react';
import './sortButton.scss';
interface SortButtonProps {
	text: string;
	column: Column<any>;
}
export function SortButton({ text, column }: SortButtonProps) {
	return (
		<Button
			variant='blank'
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			className='sort-button'
		>
			{text}
			<div className='ml-2'>
				<CaretUp
					size={8}
					className={cn('text-icon-base', column.getIsSorted() === 'asc' && 'text-icon-secondary')}
					weight='fill'
				/>
				<CaretDown
					size={8}
					className={cn('text-icon-base', column.getIsSorted() === 'desc' && 'text-icon-secondary')}
					weight='fill'
				/>
			</div>
		</Button>
	);
}
