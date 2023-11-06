import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { Button } from '@/components/Button';
import { Pencil } from '@/components/icons';
import { Trash } from '@phosphor-icons/react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../Tooltip';
import { useTranslation } from 'react-i18next';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
interface ActionCellProps<T> {
	original: T;
	type: 'org' | 'app';
	canEditKey: string;
	canDeleteKey?: string;
	children?: React.ReactNode;
	disabled?: boolean;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
}

function ActionsCell<T>({
	original,
	onEdit,
	onDelete,
	canEditKey,
	canDeleteKey,
	children,
	type,
	disabled,
}: ActionCellProps<T>) {
	const { t } = useTranslation();
	const HAS_EDIT_PERMISSION: Record<string, boolean> = {
		org: useAuthorizeOrg(canEditKey),
		app: useAuthorizeVersion(canEditKey),
	};
	const HAS_DELETE_PERMISSION: Record<string, boolean> = {
		org: useAuthorizeOrg(canDeleteKey as string),
		app: useAuthorizeVersion(canDeleteKey as string),
	};

	return (
		<div className='flex items-center justify-end'>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							iconOnly
							variant='blank'
							rounded
							className='text-xl hover:bg-wrapper-background-hover text-icon-base'
							onClick={() => onEdit?.(original)}
							disabled={disabled ?? !HAS_EDIT_PERMISSION[type]}
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
								className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
								iconOnly
								onClick={() => onDelete?.(original)}
								disabled={disabled ?? !HAS_DELETE_PERMISSION[type]}
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
