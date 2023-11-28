import { APIError } from '@/types';
import { useLoaderData } from 'react-router-dom';

export default function ConfirmChangeEmail() {
	const { error } = useLoaderData() as { error: APIError };
	return <div>{error && <div>{error.details}</div>}</div>;
}
