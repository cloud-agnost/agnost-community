import { Badge } from '@/components/Badge';
import { HTTP_METHOD_BADGE_MAP } from '@/constants';
import { useDebounce, useTabIcon } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { SearchCodeResult, TabTypes } from '@/types';
import { cn, generateId } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import _, { capitalize } from 'lodash';
import { MouseEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from '../ExplorerCollapsible';
import SideBarButton from '../SideBarButton';
import CodeSearchInput from './CodeSearchInput';
export default function CodeSearch() {
	const {
		isSearchViewOpen,
		searchCodeResult,
		openCodeResultIndexes,
		codeSearchTerm,
		matchCase,
		matchWholeWord,
		searchCode,
		toggleCodeResult,
	} = useVersionStore();
	const searchTerm = useDebounce(codeSearchTerm, 500);
	const getIcon = useTabIcon('w-3.5 h-3.5');
	const { versionId, orgId, appId } = useParams() as Record<string, string>;
	const { addTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	useQuery({
		queryKey: ['searchCode', searchTerm, matchCase, matchWholeWord, appId, orgId, versionId],
		refetchOnWindowFocus: false,
		queryFn: async () =>
			searchCode({
				appId,
				orgId,
				versionId,
				find: searchTerm,
				matchCase,
				matchWholeWord,
				page: 0,
				size: 250,
				sortBy: 'name',
				sortDir: 'asc',
			}),
		enabled: !!searchTerm && isSearchViewOpen,
	});

	function navigate(e: MouseEvent<HTMLButtonElement>, item: SearchCodeResult) {
		e.stopPropagation();
		addTab(versionId, {
			id: generateId(),
			title: item.name,
			path: getVersionDashboardPath(`${item.type}/${item._id}`),
			isActive: true,
			isDashboard: false,
			isDirty: false,
			type: _.capitalize(item.type) as TabTypes,
		});
	}
	return (
		<div className='h-full'>
			<CodeSearchInput />
			<div className='mt-4 space-y-2'>
				{searchCodeResult.length
					? searchCodeResult.map((item, index) => (
							<ExplorerCollapsible
								key={item._id}
								open={openCodeResultIndexes.includes(index)}
								onOpenChange={() => toggleCodeResult(index)}
								trigger={
									<ExplorerCollapsibleTrigger
										active={openCodeResultIndexes.includes(index)}
										title={
											<div className='w-full flex items-center justify-between'>
												<div className=' flex items-center'>
													<span className='mr-2' title={item.type}>
														{getIcon(capitalize(item.type) as TabTypes)}
													</span>
													<h1
														className={cn(
															'flex-1 text-left font-normal text-sm truncate min-w-0 text-default',
														)}
													>
														{item.name}
													</h1>
												</div>
												{item.meta?.method && (
													<Badge
														variant={HTTP_METHOD_BADGE_MAP[item.meta.method]}
														text={item.meta.method}
														className='p-0.5 font-normal mr-2'
													/>
												)}
											</div>
										}
									/>
								}
							>
								{item.matchingLines.map((line, index) => (
									<SideBarButton
										key={index}
										active={false}
										onClick={(e) => navigate(e, item)}
										asChild
										className='mt-2 ml-1'
									>
										<p>{line.lineNumber}</p>
										<p
											className='truncate'
											dangerouslySetInnerHTML={{
												__html: line.lineText,
											}}
										/>
									</SideBarButton>
								))}
							</ExplorerCollapsible>
						))
					: !_.isEmpty(searchTerm) && <p className='text-xs text-center'>No results found</p>}
			</div>
		</div>
	);
}
