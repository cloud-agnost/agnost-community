import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandLoading,
} from '@/components/Command';
import { HTTP_METHOD_BADGE_MAP, TAB_ICON_MAP } from '@/constants';
import { useDebounce, useSearchTabClick, useUpdateEffect } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { TabTypes } from '@/types';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function CommandMenu({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const handleClickElement = useSearchTabClick();

	const [search, setSearch] = useState('');
	const searchTerm = useDebounce(search, 500);
	const { searchDesignElements } = useVersionStore();
	const { appId, orgId, versionId } = useParams() as Record<string, string>;

	function getIcon(type: TabTypes): JSX.Element {
		const IconComponent = TAB_ICON_MAP[type];
		return <IconComponent className='w-5 h-5 text-icon-secondary' />;
	}

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
		<CommandDialog open={open} onOpenChange={setOpen}>
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
									/>
								)}
								<p className='text-sm leading-6 text-subtle tracking-wide '>
									{_.capitalize(item.type) === TabTypes.Field && ` ${item.meta.modelName}`}
								</p>
								<p className='text-sm leading-6 tracking-wide font-sfCompact'>
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
