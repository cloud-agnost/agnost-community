import { useSearchParams } from 'react-router-dom';
export default function usePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get('p') ?? '0');
	function setPage(page: number) {
		searchParams.set('p', page.toString());
		setSearchParams(searchParams);
	}

	function resetPage() {
		searchParams.delete('p');
		setSearchParams(searchParams);
	}

	function incrementPage() {
		setPage(page + 1);
	}

	return {
		setPage,
		resetPage,
		incrementPage,
		page,
	};
}
