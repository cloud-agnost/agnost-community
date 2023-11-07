import { MODULE_PAGE_SIZE } from '@/constants';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useUpdateEffect } from '.';
import { useSearchParams, useParams } from 'react-router-dom';
import { BaseParams, BaseGetRequest } from '@/types';

interface UseFetchDataProps {
	queryFn: (params: BaseGetRequest & BaseParams) => Promise<any>;
	lastFetchedPage: number;
	dataLength: number;
	queryKey: string;
}
export default function useInfiniteScroll({
	queryFn,
	lastFetchedPage,
	dataLength,
	queryKey,
}: UseFetchDataProps) {
	const [searchParams] = useSearchParams();
	const { orgId, appId, versionId } = useParams();

	const result = useInfiniteQuery({
		queryKey: [queryKey],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			queryFn({
				orgId: orgId as string,
				versionId: versionId as string,
				appId: appId as string,
				page: pageParam,
				size: MODULE_PAGE_SIZE,
				search: searchParams.get('q') as string,
			}),
		refetchOnWindowFocus: false,
		enabled:
			(lastFetchedPage === 0 && !dataLength) ||
			Math.ceil(dataLength / MODULE_PAGE_SIZE) < lastFetchedPage,
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage.length === MODULE_PAGE_SIZE ? lastFetchedPage + 1 : undefined;
			return nextPage;
		},
	});

	useUpdateEffect(() => {
		result.refetch();
	}, [searchParams.get('q')]);

	return result;
}
