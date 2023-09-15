import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { SelectedRowButton } from '@/components/Table';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface Props<T> {
	isEmpty: boolean;
	table?: Table<T>;
	icon?: ReactNode;
	title: string;
	emptyStateTitle: string;
	createButtonTitle: string;
	children: ReactNode;
	selectedRowLength?: number;
	disabled?: boolean;
	className?: string;
	breadCrumb?: ReactNode;
	handlerButton?: ReactNode;
	onSearchInputClear?: () => void;
	onMultipleDelete?: () => void;
	onSearch: (value: string) => void;
	openCreateModal: () => void;
	viewLogs?: boolean;
}

export default function VersionTabLayout<T>({
	isEmpty,
	children,
	icon,
	breadCrumb,
	table,
	selectedRowLength,
	title,
	emptyStateTitle,
	createButtonTitle,
	disabled,
	className,
	handlerButton,
	viewLogs,
	onMultipleDelete,
	onSearch,
	openCreateModal,
	onSearchInputClear,
}: Props<T>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	function onSearchHandler(value: string) {
		setQueryParam(value);
		onSearch?.(value);
	}

	function onClearHandler() {
		setQueryParam(undefined);
		onSearchInputClear?.();
	}

	function setQueryParam(value?: string) {
		if (!value || value === '') searchParams.delete('q');
		else searchParams.set('q', value);
		setSearchParams(searchParams);
	}

	return (
		<div className={cn('h-full flex gap-y-4 flex-col', className)}>
			{breadCrumb}
			<div className='flex items-center justify-between'>
				<h1 className='text-default text-2xl text-center'>{title}</h1>
				<div className='flex items-center justify-center gap-4'>
					<SearchInput
						value={searchParams.get('q') ?? undefined}
						onSearch={onSearchHandler}
						onClear={onClearHandler}
						className='sm:w-[450px] flex-1'
					/>
					{selectedRowLength ? (
						<SelectedRowButton
							selectedRowLength={selectedRowLength}
							table={table}
							onDelete={() => onMultipleDelete?.()}
							disabled={disabled}
						/>
					) : null}
					{viewLogs && (
						<Button variant='secondary' to='logs'>
							{t('queue.view_logs')}
						</Button>
					)}
					{handlerButton ?? (
						<Button variant='primary' onClick={openCreateModal} disabled={disabled}>
							<Plus size={16} />
							<span className='ml-2'>{createButtonTitle}</span>
						</Button>
					)}
				</div>
			</div>
			{isEmpty ? (
				searchParams.has('q') ? (
					<>
						<EmptyState icon={icon} className='flex-1' title={t('general.no_result')}>
							<Button className='btn btn-primary' onClick={onClearHandler}>
								{t('general.reset_search_query')}
							</Button>
						</EmptyState>
					</>
				) : (
					<EmptyState icon={icon} className='flex-1' title={emptyStateTitle}>
						{handlerButton ?? (
							<Button variant='primary' onClick={openCreateModal} disabled={disabled}>
								<Plus size={16} />
								<span className='ml-2'>{createButtonTitle}</span>
							</Button>
						)}
					</EmptyState>
				)
			) : (
				children
			)}
		</div>
	);
}
