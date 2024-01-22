import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandLoading,
} from '@/components/Command';
import { HTTP_METHOD_BADGE_MAP } from '@/constants';
import { useDebounce, useSearchTabClick, useTabIcon, useUpdateEffect } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { TabTypes } from '@/types';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function CommandMenu() {
	const handleClickElement = useSearchTabClick();

	const [search, setSearch] = useState('');
	const searchTerm = useDebounce(search, 500);
	const { searchDesignElements, isSearchCommandMenuOpen, toggleSearchCommandMenu } =
		useVersionStore();
	const { appId, orgId, versionId } = useParams() as Record<string, string>;

	const getIcon = useTabIcon('w-5 h-5');
	useUpdateEffect(() => {
		if (!open) {
			setSearch('');
		}
	}, [open]);

	const { data, isFetching } = useQuery({
		queryKey: ['version', versionId, orgId, appId, searchTerm],
		queryFn: () =>
			searchDesignElements({
				orgId,
				appId,
				versionId,
				keyword: searchTerm,
			}),
		enabled: !!searchTerm,
	});
	return (
		<CommandDialog open={isSearchCommandMenuOpen} onOpenChange={toggleSearchCommandMenu}>
			<CommandInput value={search} onValueChange={setSearch} />
			<CommandList>
				{isFetching ? (
					<CommandLoading>
						<div className='flex items-center justify-center h-full p-4'>
							<BeatLoader color='#6884FD' size={16} margin={12} />
						</div>
					</CommandLoading>
				) : (
					data?.map((item) => (
						<Button
							key={item._id}
							variant='blank'
							className='font-normal flex justify-between py-6 px-4 hover:bg-wrapper-background-hover'
							size='full'
							onClick={() => handleClickElement(item)}
						>
							<div className='flex items-center gap-4'>
								{getIcon(_.capitalize(item.type) as TabTypes)}
								<p className='text-sm leading-6 tracking-wide font-sfCompact'>{item.name}</p>
							</div>
							<div className='flex items-center gap-4'>
								{item.meta?.method && (
									<Badge
										variant={HTTP_METHOD_BADGE_MAP[item.meta.method]}
										text={item.meta.method}
										className='min-w-[52px]'
									/>
								)}
								<p className='text-xs leading-6 text-subtle tracking-wide '>
									{_.capitalize(item.type) === TabTypes.Field && ` ${item.meta.modelName}`}
								</p>
								<p className='text-xs text-subtle leading-6 tracking-wide font-sfCompact'>
									{_.capitalize(item.type)}
								</p>
							</div>
						</Button>
					))
				)}
				{_.isEmpty(data) && searchTerm && <CommandEmpty>No results found.</CommandEmpty>}
			</CommandList>
		</CommandDialog>
	);
}
