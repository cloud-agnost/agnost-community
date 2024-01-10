import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from '@/components/Command';
import { HTTP_METHOD_BADGE_MAP, TAB_ICON_MAP } from '@/constants';
import { useDebounce, useSearchTabClick, useUpdateEffect } from '@/hooks';
import { VersionLayout } from '@/layouts/VersionLayout';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { TabTypes } from '@/types';
import { cn, joinChannel } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';

export default function Version() {
	const { pathname } = useLocation();
	const [search, setSearch] = useState('');
	const searchTerm = useDebounce(search, 500);
	const { getVersionById } = useVersionStore();
	const { getAppById, application } = useApplicationStore();
	const { searchDesignElements } = useVersionStore();
	const handleClickElement = useSearchTabClick();
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const [open, setOpen] = useState(false);

	const { appId, orgId, versionId } = useParams() as Record<string, string>;

	function getIcon(type: TabTypes): JSX.Element {
		const IconComponent = TAB_ICON_MAP[type];
		return <IconComponent className='w-5 h-5 text-icon-secondary' />;
	}

	useEffect(() => {
		if (_.isEmpty(application)) {
			getAppById(orgId as string, appId as string);
		} else {
			joinChannel(appId as string);
		}
	}, [appId]);

	useEffect(() => {
		getVersionById({
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
		});
	}, [versionId]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

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
		<VersionLayout
			className={cn(
				paths.slice(-1).pop(),
				paths.some((p) => p === 'settings') && '!overflow-hidden',
			)}
		>
			<Outlet />
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
		</VersionLayout>
	);
}
