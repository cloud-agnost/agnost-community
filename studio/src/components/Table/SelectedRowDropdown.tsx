import { Minus, Trash } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';

interface Props {
	onDelete: () => void;
	selectedRowLength: number;
	table: Table<any>;
}
function SelectedRowDropdown({ onDelete, selectedRowLength, table }: Props) {
	const { t } = useTranslation();
	return selectedRowLength > 0 ? (
		<div className='flex items-center  border border-border rounded-md bg-lighter'>
			<div className='flex items-center gap-2 border-r border-button-border p-1.5'>
				<Button
					size='sm'
					variant='primary'
					className=' bg-button-primary h-1/2 px-1'
					onClick={() => table?.resetRowSelection()}
				>
					<Minus size={16} weight='bold' className='text-icon-secondary' />
				</Button>

				<span className='font-sfCompact text-sm text-elements-blue'>
					{t('general.selected', {
						count: selectedRowLength,
					})}
				</span>
			</div>

			<Button variant='blank' iconOnly onClick={onDelete}>
				<Trash size={20} className='text-icon-base' />
			</Button>
		</div>
	) : null;
}

export default SelectedRowDropdown;
