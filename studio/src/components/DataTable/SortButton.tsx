import { cn } from '@/utils';
import { Column } from '@tanstack/react-table';
import { Button } from '../Button';
import { CaretUp, CaretDown } from '@phosphor-icons/react';

interface SortButtonProps {
	text: string;
	column: Column<any>;
}
export function SortButton({ text, column }: SortButtonProps) {
	console.log('column', column.getIsSorted());
	return (
		<Button variant='text' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
			{text}
			<div className='ml-2'>
				<CaretUp
					size={12}
					className={cn('text-icon-base', column.getIsSorted() === 'asc' && 'text-icon-secondary')}
					weight='fill'
				/>
				<CaretDown
					size={12}
					className={cn('text-icon-base', column.getIsSorted() === 'desc' && 'text-icon-secondary')}
					weight='fill'
				/>
			</div>
		</Button>
	);
}
