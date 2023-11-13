import { Button } from '@/components/Button';
import { Pencil } from '@/components/icons';
import { Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
interface ActionCellProps<T> {
	original: T;
	canEdit: boolean;
	canDelete?: boolean;
	children?: React.ReactNode;
	disabled?: boolean;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
}

function ActionsCell<T>({
	original,
	onEdit,
	onDelete,
	canEdit,
	canDelete,
	children,
	disabled,
}: ActionCellProps<T>) {
	const { t } = useTranslation();

	return (
		<div className='flex items-center justify-end'>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							iconOnly
							variant='blank'
							rounded
							className='text-xl hover:bg-wrapper-background-hover text-icon-base hover:text-default aspect-square'
							onClick={() => onEdit?.(original)}
							disabled={disabled || !canEdit}
						>
							<Pencil />
						</Button>
					</TooltipTrigger>
					<TooltipContent>{t('general.edit')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{children ?? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='blank'
								rounded
								className='hover:bg-wrapper-background-hover text-icon-base hover:text-default aspect-square'
								iconOnly
								onClick={() => onDelete?.(original)}
								disabled={disabled || !canDelete}
							>
								<Trash size={20} />
							</Button>
						</TooltipTrigger>
						<TooltipContent>{t('general.delete')}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}

export default ActionsCell;
