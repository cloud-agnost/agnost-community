import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { SelectedRowButton } from '@/components/Table';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
interface Props<T> {
	isEmpty: boolean;
	table: Table<T>;
	icon?: React.ReactNode;
	title: string;
	emptyStateTitle: string;
	createButtonTitle: string;
	children: React.ReactNode;
	selectedRowLength: number;
	onMultipleDelete: () => void;
	onSearch: (value: string) => void;
	openCreateModal: () => void;
	disabled?: boolean;
}

export default function VersionTabLayout<T>({
	isEmpty,
	children,
	icon,
	table,
	selectedRowLength,
	title,
	emptyStateTitle,
	createButtonTitle,
	disabled,
	onMultipleDelete,
	onSearch,
	openCreateModal,
}: Props<T>) {
	const [searchParams] = useSearchParams();
	return (
		<div className={cn(isEmpty && 'h-3/4 flex items-center justify-center')}>
			{isEmpty ? (
				<EmptyState icon={icon} title={emptyStateTitle}>
					<Button className='btn btn-primary' onClick={openCreateModal}>
						<Plus size={16} />
						<span className='ml-2'>{createButtonTitle}</span>
					</Button>
				</EmptyState>
			) : (
				<div className='p-4 space-y-4'>
					<div className='flex items-center justify-between'>
						<h1 className='text-default text-2xl font-semibold text-center'>{title}</h1>
						<div className='flex items-center justify-center gap-6'>
							<SearchInput
								value={searchParams.get('q') ?? undefined}
								onSearch={onSearch}
								className='sm:w-[450px] flex-1'
							/>
							<SelectedRowButton
								selectedRowLength={selectedRowLength}
								table={table}
								onDelete={onMultipleDelete}
								disabled={disabled}
							/>
							<Button variant='primary' onClick={openCreateModal} disabled={disabled}>
								<Plus size={16} />
								<span className='ml-2'>{createButtonTitle}</span>
							</Button>
						</div>
					</div>
					{children}
				</div>
			)}
		</div>
	);
}
