import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from 'components/SearchInput';
import { Badge } from 'components/Badge';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from 'components/Drawer';
import { Endpoint, Method, SortOption } from '@/types';
import useEndpointStore from '@/store/endpoint/endpointStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TableLoading } from 'components/Table/Table.tsx';
import { Checkbox } from 'components/Checkbox';
import { BadgeColors } from 'components/Badge/Badge.tsx';
import { cn } from '@/utils';
import { CheckedState } from '@radix-ui/react-checkbox';
import { EmptyState } from 'components/EmptyState';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from 'components/Dropdown';
import { Button } from 'components/Button';
import { Check, Funnel, FunnelSimple } from '@phosphor-icons/react';
import { ALL_HTTP_METHODS, ENDPOINT_OPTIONS } from '@/constants';
import { useTranslation } from 'react-i18next';

interface EndpointSelectModalProps {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultSelected?: string[];
	onSelect?: (selected: string[]) => void;
}
const LIMIT = 20;

const badgeMapping: Record<string, BadgeColors> = {
	GET: 'orange',
	POST: 'green',
	PUT: 'yellow',
	DELETE: 'red',
};
interface FetchEndpoints {
	defaultPage?: number;
	init?: boolean;
	search?: string;
	sort?: SortOption;
}

export default function EndpointSelectModal({
	open,
	onOpenChange,
	onSelect,
	defaultSelected,
}: EndpointSelectModalProps) {
	const { getEndpoints } = useEndpointStore();
	const [loading, setLoading] = useState(false);
	const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
	const [page, setPage] = useState(0);
	const [lastDataCount, setLastDataCount] = useState(endpoints.length);
	const [selected, setSelected] = useState<string[]>(defaultSelected ?? []);
	const [methods, setMethods] = useState<Method[]>([]);
	const [sortOption, setSortOption] = useState<SortOption>(ENDPOINT_OPTIONS[0]);
	const { version } = useVersionStore();
	const { t } = useTranslation();

	useEffect(() => {
		if (!open) return;
		fetchEndpoints({ init: true });
	}, [open]);

	const filtered = useMemo(() => {
		if (methods.length === 0) return endpoints;
		return endpoints.filter((e) => methods.includes(e.method));
	}, [methods, endpoints]);

	async function fetchEndpoints({ defaultPage, search, init, sort }: FetchEndpoints) {
		if (!version) return;
		if (init) setLoading(true);
		const endpoints = await getEndpoints({
			orgId: version.orgId,
			appId: version.appId,
			versionId: version._id,
			page: defaultPage ?? page,
			search: search ?? undefined,
			sortDir: (sort ?? sortOption).sortDir,
			sortBy: (sort ?? sortOption).value,
			size: LIMIT,
		});
		setLastDataCount(endpoints.length);
		if (init) {
			setEndpoints(endpoints);
		} else setEndpoints((prev) => [...prev, ...endpoints]);
		setLoading(false);
	}

	function next() {
		setPage((page) => {
			fetchEndpoints({ defaultPage: page + 1 });
			return page + 1;
		});
	}

	function addList(endpoint: Endpoint, checked: CheckedState) {
		setSelected((prev) => {
			const all = checked ? [...prev, endpoint.iid] : prev.filter((id) => id !== endpoint.iid);
			if (onSelect) onSelect(all);
			return all;
		});
	}

	function onSearch(value: string) {
		fetchEndpoints({ init: true, search: value });
	}

	function onMethodSelect(method: Method) {
		setMethods((prev) => {
			return prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method];
		});
	}

	function onSortChanged(sort: SortOption) {
		setSortOption(sort);
		fetchEndpoints({ sort, init: true });
	}

	return (
		<Drawer modal open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='center'>
				<div className='font-sfCompact p-2 flex gap-2 items-center border-b'>
					<SearchInput
						onClear={() => onSearch('')}
						onSearch={onSearch}
						className='flex-1 [&_input]:border-none [&_input]:bg-transparent'
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline'>
								<Funnel className='mr-2' size={16} weight='fill' />
								<span>{t('general.filter')}</span>
								{methods.length > 0 && <span className='ml-1'>({methods.length})</span>}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='start' className='w-40'>
							{methods.length > 0 && (
								<>
									<DropdownMenuLabel className='pb-1'>
										<div className='flex items-center gap-2 overflow-auto no-scrollbar'>
											{methods.map((method, index) => (
												<Badge
													className='pl-2 pr-1'
													onClear={() => onMethodSelect(method)}
													text={method}
													clearable
													variant={badgeMapping[method]}
													key={index}
												/>
											))}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
								</>
							)}
							{ALL_HTTP_METHODS.map((method, index) => (
								<DropdownMenuItem
									onClick={() => onMethodSelect(method)}
									key={index}
									className='flex items-center justify-between p-[6px]'
								>
									<Badge text={method} variant={badgeMapping[method]} />
									{methods.includes(method) && <Check />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' className='gap-2'>
								<FunnelSimple size={16} />
								{sortOption.name}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-28'>
							{ENDPOINT_OPTIONS.map((sort) => (
								<DropdownMenuItem
									key={sort.name}
									className='flex items-center justify-between'
									onClick={() => onSortChanged(sort)}
								>
									{sort.name}
									{sortOption.name === sort.name && <Check />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className='pt-4'>
					{endpoints.filter((ep) => selected.includes(ep.iid)).length > 0 && (
						<div className='p-4 pt-0 space-y-2'>
							<span className='text-subtle text-sm leading-6'>{t('version.api_key.selected')}</span>
							<div className='flex items-center gap-2 overflow-auto no-scrollbar overscroll-contain'>
								{endpoints
									.filter((ep) => selected.includes(ep.iid))
									.map((ep) => (
										<Badge
											className='pl-2 pr-1'
											onClear={() => addList(ep, false)}
											clearable
											key={ep._id}
											text={ep.name}
										/>
									))}
							</div>
						</div>
					)}
					<div className='space-y-2'>
						{filtered.length > 0 && (
							<span className='px-4 text-subtle text-sm leading-6'>Endpoints</span>
						)}
						<div id='endpoint-list-container' className='h-[250px] overflow-auto'>
							{!loading && (
								<InfiniteScroll
									scrollableTarget='endpoint-list-container'
									next={next}
									hasMore={lastDataCount >= LIMIT}
									loader={<TableLoading />}
									dataLength={filtered.length}
								>
									{filtered.length === 0 ? (
										<EmptyState title='No endpoints found' />
									) : (
										filtered.map((endpoint, index) => {
											const checked = selected.includes(endpoint.iid);
											const id = `endpoint-${endpoint._id}`;
											return (
												<div
													className={cn(
														'peer-checked:bg-wrapper-background-light px-4 h-[40px] grid grid-cols-[24px_1fr] gap-2',
														checked && 'bg-wrapper-background-light',
													)}
													key={index}
												>
													<Checkbox
														id={id}
														checked={checked}
														onCheckedChange={(checked) => addList(endpoint, checked)}
													/>
													<label htmlFor={id} className='flex items-center gap-4 cursor-pointer'>
														<Badge variant={badgeMapping[endpoint.method]} text={endpoint.method} />
														<p className='text-sm text-default leading-6'>{endpoint.name}</p>
													</label>
												</div>
											);
										})
									)}
								</InfiniteScroll>
							)}
						</div>
					</div>
				</div>
				<DrawerFooter className='p-4'>
					<DrawerClose asChild>
						<Button size='lg'>{t('general.close')}</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
