import { cn } from '@/utils';
import { CaretUp } from '@phosphor-icons/react';
import { Column } from '@tanstack/react-table';
import { Button } from '../Button';
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
					size={14}
					className={cn(
						'text-icon-base',
						column.getIsSorted() === 'asc' && 'rotate-180 text-icon-secondary',
					)}
				/>
			</div>
		</Button>
	);
}
