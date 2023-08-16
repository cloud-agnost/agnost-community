import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { Button } from '@/components/Button';
import { Pencil } from '@/components/icons';
import { Trash } from '@phosphor-icons/react';

interface ActionCellProps<T> {
	original: T;
	type: 'org' | 'app' | 'version';
	onEdit?: (item: T) => void;
	to?: string;
	onDelete?: (item: T) => void;
	canEditKey: string;
	canDeleteKey?: string;
	children?: React.ReactNode;
}

function ActionCell<T>({
	original,
	onEdit,
	onDelete,
	canEditKey,
	canDeleteKey,
	to,
	children,
	type,
}: ActionCellProps<T>) {
	const HAS_EDIT_PERMISSION: Record<string, boolean> = {
		org: useAuthorizeVersion(canEditKey),
		app: useAuthorizeVersion(canEditKey),
		version: useAuthorizeVersion(canEditKey),
	};
	const HAS_DELETE_PERMISSION: Record<string, boolean> = {
		org: useAuthorizeVersion(canDeleteKey as string),
		app: useAuthorizeVersion(canDeleteKey as string),
		version: useAuthorizeVersion(canDeleteKey as string),
	};

	return (
		<div className='flex items-center justify-end'>
			<Button
				iconOnly
				variant='blank'
				rounded
				className='text-xl hover:bg-wrapper-background-hover text-icon-base'
				onClick={() => onEdit?.(original)}
				disabled={!HAS_EDIT_PERMISSION[type]}
				to={to as string}
			>
				<Pencil />
			</Button>
			{children ? (
				children
			) : (
				<Button
					variant='blank'
					rounded
					className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
					iconOnly
					onClick={() => onDelete?.(original)}
					disabled={!HAS_DELETE_PERMISSION[type]}
				>
					<Trash size={20} />
				</Button>
			)}
		</div>
	);
}

export default ActionCell;
