import { MODULE_PAGE_SIZE } from '@/constants';
import { useInfiniteQuery } from '@tanstack/react-query';
import useUpdateEffect from './useUpdateEffect';
import { useSearchParams, useParams } from 'react-router-dom';
import { BaseParams, BaseGetRequest } from '@/types';

interface UseFetchDataProps<T = any> {
	queryFn: (params: BaseGetRequest & BaseParams & T) => Promise<any>;
	lastFetchedPage: number;
	dataLength: number;
	queryKey: string;
	params?: T;
	disableVersionParams?: boolean;
}
export default function useInfiniteScroll({
	queryFn,
	lastFetchedPage,
	dataLength,
	queryKey,
	params,
	disableVersionParams,
}: UseFetchDataProps) {
	const [searchParams] = useSearchParams();
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const result = useInfiniteQuery({
		queryKey: [queryKey],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			queryFn({
				...(!disableVersionParams && {
					orgId,
					versionId,
					appId,
				}),
				page: pageParam,
				size: MODULE_PAGE_SIZE,
				search: searchParams.get('q') as string,
				sortBy: searchParams.get('f') as string,
				sortDir: searchParams.get('d') as string,
				...params,
			}),
		refetchOnWindowFocus: false,
		enabled:
			(lastFetchedPage === 0 && dataLength <= 1) ||
			Math.ceil(dataLength / MODULE_PAGE_SIZE) < lastFetchedPage,
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage?.length === MODULE_PAGE_SIZE ? lastFetchedPage + 1 : undefined;
			return nextPage;
		},
	});

	useUpdateEffect(() => {
		result.refetch();
	}, [searchParams.get('q'), searchParams.get('f'), searchParams.get('d')]);

	useUpdateEffect(() => {
		result.refetch();
	}, [orgId, appId, versionId]);

	return result;
}
