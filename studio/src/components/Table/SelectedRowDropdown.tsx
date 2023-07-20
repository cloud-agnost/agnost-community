import { Trash } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useTranslation } from 'react-i18next';

interface Props {
	onDelete: () => void;
	selectedRowLength: number;
}
function SelectedRowDropdown({ onDelete, selectedRowLength }: Props) {
	const { t } = useTranslation();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline'>
					{selectedRowLength > 0 ? (
						<span>
							{t('general.selected', {
								count: selectedRowLength,
							})}
						</span>
					) : (
						<span>{t('general.actions')}</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={onDelete}>
					<Trash size={16} className='members-filter-icon' />
					<span>{t('general.delete_all')}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default SelectedRowDropdown;
