import { cn } from '@/utils';
import { Minus, Trash } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoModal } from '../InfoModal';
interface Props<T> {
	onDelete: () => void;
	table: Table<T>;
	className?: string;
	disabled?: boolean;
}
function SelectedRowButton<T>({ onDelete, table, className, disabled }: Props<T>) {
	const { t } = useTranslation();
	const [openInfoModal, setOpenInfoModal] = useState(false);

	return (
		<>
			<div className={cn('flex items-center rounded-md bg-lighter', className)}>
				<div className='flex items-center gap-2 border-r border-button-border p-1.5'>
					{table && (
						<Button
							size='sm'
							variant='primary'
							className='bg-button-primary h-1/2 p-1'
							onClick={() => table?.resetRowSelection()}
						>
							<Minus size={16} weight='bold' className='text-icon-default' />
						</Button>
					)}

					<span className='font-sfCompact text-sm text-elements-blue'>
						{t('general.selected', {
							count: table.getSelectedRowModel().rows.length,
						})}
					</span>
				</div>

				<Button variant='blank' iconOnly onClick={() => setOpenInfoModal(true)} disabled={disabled}>
					<Trash size={20} className='text-icon-base' />
				</Button>
			</div>
			<InfoModal
				isOpen={openInfoModal}
				closeModal={() => setOpenInfoModal(false)}
				title={t('general.multiDelete')}
				description={t('general.deleteDescription')}
				onConfirm={onDelete}
			/>
		</>
	);
}

export default SelectedRowButton;
