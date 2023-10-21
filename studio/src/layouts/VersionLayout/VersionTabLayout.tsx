import { Button } from '@/components/Button';
import { EmptyState, Modules } from '@/components/EmptyState';
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
	type: Modules;
	title: string;
	emptyStateTitle: string;
	createButtonTitle?: string | null;
	children: ReactNode;
	selectedRowLength?: number;
	disabled?: boolean;
	className?: string;
	breadCrumb?: ReactNode;
	handlerButton?: ReactNode;
	onMultipleDelete?: () => void;
	openCreateModal?: () => void;
	onSearch?: () => void;
}

export default function VersionTabLayout<T>({
	isEmpty,
	children,
	type,
	breadCrumb,
	table,
	selectedRowLength,
	title,
	emptyStateTitle,
	createButtonTitle,
	disabled,
	className,
	handlerButton,
	onMultipleDelete,
	openCreateModal,
	onSearch,
}: Props<T>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	function onClearHandler() {
		searchParams.delete('q');
		setSearchParams(searchParams);
	}

	let content;

	if (isEmpty) {
		if (searchParams.has('q')) {
			content = (
				<EmptyState type={type} className='flex-1' title={t('general.no_result')}>
					<Button className='btn btn-primary' onClick={onClearHandler}>
						{t('general.reset_search_query')}
					</Button>
				</EmptyState>
			);
		} else {
			content = (
				<EmptyState type={type} className='flex-1' title={emptyStateTitle}>
					{!!createButtonTitle && !!openCreateModal ? (
						<Button variant='primary' onClick={openCreateModal} disabled={disabled}>
							<Plus size={16} />
							<span className='ml-2'>{createButtonTitle}</span>
						</Button>
					) : (
						handlerButton
					)}
				</EmptyState>
			);
		}
	} else {
		content = children;
	}
	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		if (onSearch) onSearch();
		setSearchParams({ ...searchParams, q: value });
	}
	return (
		<div className={cn('h-full space-y-4 ', className)}>
			{breadCrumb}
			<div className='flex items-center justify-between'>
				<h1 className='text-default text-2xl text-center'>{title}</h1>
				<div className='flex items-center justify-center gap-4'>
					{onSearch && (
						<SearchInput
							value={searchParams.get('q') ?? undefined}
							onSearch={onInput}
							onClear={onClearHandler}
							className='sm:w-[450px] flex-1'
						/>
					)}
					{selectedRowLength ? (
						<SelectedRowButton
							selectedRowLength={selectedRowLength}
							table={table}
							onDelete={() => onMultipleDelete?.()}
							disabled={disabled}
						/>
					) : null}
					{handlerButton}
					{!!createButtonTitle && !!openCreateModal && (
						<Button variant='primary' onClick={openCreateModal} disabled={disabled}>
							<Plus size={16} />
							<span className='ml-2'>{createButtonTitle}</span>
						</Button>
					)}
				</div>
			</div>
			{content}
		</div>
	);
}
