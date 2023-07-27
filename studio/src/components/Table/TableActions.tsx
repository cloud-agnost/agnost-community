import { Button } from '../Button';
import { Trash } from '@phosphor-icons/react';
import { TableConfirmation } from '../Table';
import { Pencil } from 'components/icons';
interface Props {
	onDelete: () => void;
	onEdit: () => void;
	confirmationTitle: string;
	confirmationDescription: string;
}
export default function TableActions({
	onDelete,
	onEdit,
	confirmationTitle,
	confirmationDescription,
}: Props) {
	return (
		<div className='flex items-center '>
			<Button variant='blank' iconOnly onClick={onEdit}>
				<Pencil className='w-6 h-6 text-icon-base' />
			</Button>
			<TableConfirmation
				title={confirmationTitle}
				description={confirmationDescription}
				onConfirm={onDelete}
			>
				<Button variant='blank' iconOnly>
					<Trash size={24} className='text-icon-base' />
				</Button>
			</TableConfirmation>
		</div>
	);
}
