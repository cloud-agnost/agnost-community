import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { DraggableProvided } from 'react-beautiful-dnd';

interface RateLimitProps<T> {
	provided: DraggableProvided;
	item: T;
	onDelete: (id: string) => void;
	loading?: boolean;
}
export default function SortableItem<T extends { name: string; iid: string }>({
	provided,
	item,
	onDelete,
	loading,
}: RateLimitProps<T>) {
	return (
		<li
			className='p-2 flex items-center gap-2 rounded text-default text-sm font-sfCompact leading-6 font-normal bg-lighter'
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
		>
			<DotsSixVertical size={20} className='text-icon-base text-lg cursor-move' />
			<span>{item?.name}</span>
			<Button
				type='button'
				onClick={() => onDelete(item?.iid)}
				iconOnly
				loading={loading}
				variant='blank'
				rounded
				className='ml-auto text-lg text-icon-base aspect-square hover:bg-base hover:text-default'
			>
				<Trash />
			</Button>
		</li>
	);
}
