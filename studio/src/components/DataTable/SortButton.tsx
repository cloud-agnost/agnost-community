import { cn } from '@/utils';
import { CaretUp } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../Button';
import './sortButton.scss';
interface SortButtonProps {
	text: string;
	className?: string;
	field: string;
}
export function SortButton({ text, className, field }: SortButtonProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const defaultDirection = 'asc';
	const handleSortClick = () => {
		const currentField = searchParams.get('f');
		const currentDirection = searchParams.get('d');
		let newDirection = defaultDirection;
		if (currentField === field) {
			newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
		}
		searchParams.set('f', field);
		searchParams.set('d', newDirection);
		setSearchParams(searchParams);
	};
	return (
		<Button variant='blank' onClick={handleSortClick} className={cn('sort-button', className)}>
			{text}
			{searchParams.get('f') === field && (
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
	);
}
