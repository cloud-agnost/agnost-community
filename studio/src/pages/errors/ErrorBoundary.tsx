import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
	const error = useRouteError();

	console.error('Error', error);

	// TODO: refactor this page
	return (
		<div className='flex items-center justify-center h-screen text-default'>
			something went wrong please check your console
		</div>
	);
}
