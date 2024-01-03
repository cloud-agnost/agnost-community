import { Button } from '@/components/Button';
import { EmptyState, Modules } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { SelectedRowButton } from '@/components/Table';
import { useUpdateEffect } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
interface Props<T> {
	isEmpty: boolean;
	table?: Table<T>;
	type: Modules;
	title?: string;
	emptyStateTitle: string;
	createButtonTitle?: string | null;
	children: ReactNode;
	disabled?: boolean;
	className?: string;
	breadCrumb?: ReactNode;
	handlerButton?: ReactNode;
	loading: boolean;
	searchable?: boolean;
	onMultipleDelete?: () => void;
	openCreateModal?: () => void;
}

export default function VersionTabLayout<T>({
	isEmpty,
	children,
	type,
	breadCrumb,
	table,
	title,
	emptyStateTitle,
	createButtonTitle,
	disabled,
	className,
	handlerButton,
	loading,
	searchable,
	onMultipleDelete,
	openCreateModal,
}: Props<T>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { versionId } = useParams<{ versionId: string }>();
	const { pathname, search } = useLocation();
	const { t } = useTranslation();
	const { updateCurrentTab } = useTabStore();

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
	useUpdateEffect(() => {
		updateCurrentTab(versionId as string, {
			path: pathname + search,
		});
	}, [search]);
	return (
		<div className={cn('h-full space-y-4 relative ', className)}>
			<div className={cn(!title ? 'flex items-center justify-between' : 'space-y-4')}>
				{breadCrumb}
				<div className='flex items-center justify-between flex-1'>
					<h1 className='text-default text-xl text-center'>{title}</h1>
					<div className='flex items-center justify-center gap-4'>
						{searchable && (
							<SearchInput
								value={searchParams.get('q') ?? undefined}
								className='sm:w-[450px] flex-1'
							/>
						)}
						{table?.getSelectedRowModel().rows.length ? (
							<SelectedRowButton
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
			</div>
			{!loading && content}
			<BeatLoader
				color='#6884FD'
				className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
				size={24}
				loading={loading}
				margin={18}
			/>
		</div>
	);
}
