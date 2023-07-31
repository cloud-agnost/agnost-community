import { Minus, Trash } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { Button } from 'components/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoModal } from '../InfoModal';
import { Warning } from '../icons';
interface Props<T> {
	onDelete: () => void;
	selectedRowLength: number;
	table?: Table<T>;
}
function SelectedRowDropdown<T>({ onDelete, selectedRowLength, table }: Props<T>) {
	const { t } = useTranslation();
	const [openInfoModal, setOpenInfoModal] = useState(false);
	return selectedRowLength > 0 ? (
		<>
			<div className='flex items-center  border border-border rounded-md bg-lighter'>
				<div className='flex items-center gap-2 border-r border-button-border p-1.5'>
					{table && (
						<Button
							size='sm'
							variant='primary'
							className=' bg-button-primary h-1/2 px-1'
							onClick={() => table?.resetRowSelection()}
						>
							<Minus size={16} weight='bold' className='text-icon-secondary' />
						</Button>
					)}

					<span className='font-sfCompact text-sm text-elements-blue'>
						{t('general.selected', {
							count: selectedRowLength,
						})}
					</span>
				</div>

				<Button variant='blank' iconOnly onClick={() => setOpenInfoModal(true)}>
					<Trash size={20} className='text-icon-base' />
				</Button>
			</div>
			<InfoModal
				isOpen={openInfoModal}
				closeModal={() => setOpenInfoModal(false)}
				title={t('general.multiDelete')}
				description={t('general.deleteDescription')}
				icon={<Warning className='text-icon-danger w-20 h-20' />}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button
							variant='text'
							size='lg'
							onClick={(e) => {
								e.stopPropagation();
								setOpenInfoModal(false);
							}}
						>
							{t('general.cancel')}
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
						>
							{t('general.ok')}
						</Button>
					</div>
				}
			/>
		</>
	) : null;
}

export default SelectedRowDropdown;
