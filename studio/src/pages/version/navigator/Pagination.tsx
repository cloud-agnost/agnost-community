import { Button } from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import useNavigatorStore from '@/store/database/navigatorStore';
import { BucketCountInfo } from '@/types';
import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

export function Pagination() {
	const { modelId } = useParams() as Record<string, string>;
	const { dataCountInfo } = useNavigatorStore();

	const [searchParams, setSearchParams] = useSearchParams();
	// todo update tab path
	function goToNextPage() {
		const currentPage = countInfo?.currentPage;
		const nextPage = currentPage + 1;
		searchParams.set('page', nextPage.toString());
		setSearchParams(searchParams);
	}

	function goToPreviousPage() {
		const currentPage = countInfo?.currentPage;
		const previousPage = currentPage - 1;
		searchParams.set('page', previousPage.toString());
		setSearchParams(searchParams);
	}

	function goToFirstPage() {
		searchParams.set('page', '0');
		setSearchParams(searchParams);
	}

	function goToLastPage() {
		const pageCount = countInfo?.totalPages;
		searchParams.set('page', pageCount.toString());
		setSearchParams(searchParams);
	}

	function changePageSize(value: string) {
		searchParams.set('size', value);
		setSearchParams(searchParams);
	}

	const countInfo: BucketCountInfo = useMemo(
		() => ({
			totalCount: dataCountInfo?.[modelId]?.totalCount ?? 0,
			count: dataCountInfo?.[modelId]?.count ?? 0,
			currentPage: dataCountInfo?.[modelId]?.currentPage ?? 0,
			pageSize: dataCountInfo?.[modelId]?.pageSize ?? 0,
			totalPages: dataCountInfo?.[modelId]?.totalPages ?? 0,
		}),
		[dataCountInfo],
	);

	const paginationInfo = useMemo(
		() => ({
			dataCount: countInfo.pageSize * countInfo.currentPage + countInfo.count,
			pageIndex: countInfo.currentPage === 0 ? 1 : countInfo.pageSize * countInfo.currentPage + 1,
		}),
		[countInfo],
	);

	return (
		<div className='flex items-center justify-end mt-4 gap-2'>
			<div className='flex items-center space-x-2'>
				<p className='text-xs '>Rows per page</p>
				<Select value={searchParams.get('size') ?? '25'} onValueChange={changePageSize}>
					<SelectTrigger className='h-8 w-[70px] text-xs'>
						<SelectValue placeholder={25} />
					</SelectTrigger>
					<SelectContent side='top' className='w-[20px]'>
						{[25, 50, 75, 100].map((pageSize) => (
							<SelectItem key={pageSize} value={`${pageSize}`} className='text-xs'>
								{pageSize}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className='flex w-[100px] items-center justify-center text-xs '>
				{paginationInfo.pageIndex} of {paginationInfo.dataCount}
			</div>
			<div className='flex items-center space-x-2'>
				<Button
					variant='icon'
					size='sm'
					rounded
					className='hidden h-8 w-8 p-0 lg:flex'
					onClick={goToFirstPage}
					disabled={!countInfo?.currentPage}
				>
					<span className='sr-only'>Go to first page</span>
					<CaretDoubleLeft className='h-4 w-4' />
				</Button>
				<Button
					variant='icon'
					size='sm'
					rounded
					className='h-8 w-8 p-0'
					onClick={goToPreviousPage}
					disabled={!countInfo?.currentPage}
				>
					<span className='sr-only'>Go to previous page</span>
					<CaretLeft className='h-4 w-4' />
				</Button>
				<p className='text-xs'>
					{countInfo?.currentPage + 1} of {countInfo?.totalPages + 1}
				</p>
				<Button
					variant='icon'
					size='sm'
					rounded
					className='h-8 w-8 p-0'
					onClick={goToNextPage}
					disabled={countInfo?.totalPages === countInfo?.currentPage}
				>
					<span className='sr-only'>Go to next page</span>
					<CaretRight className='h-4 w-4' />
				</Button>
				<Button
					variant='icon'
					size='sm'
					rounded
					className='hidden h-8 w-8 p-0 lg:flex'
					onClick={goToLastPage}
					disabled={countInfo?.totalPages === countInfo?.currentPage}
				>
					<span className='sr-only'>Go to last page</span>
					<CaretDoubleRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}
