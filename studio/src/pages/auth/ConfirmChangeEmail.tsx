import useAuthStore from '@/store/auth/authStore.ts';
import { json, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';
import { APIError } from '@/types';

export default function ConfirmChangeEmail() {
	const { error } = useLoaderData() as { error: APIError };
	return <div>{error && <div>{error.details}</div>}</div>;
}

ConfirmChangeEmail.loader = async function ({ request }: LoaderFunctionArgs) {
	const token = new URL(request.url).searchParams.get('token');
	if (!token) {
		return redirect('/login');
	}

	try {
		await useAuthStore.getState().confirmChangeLoginEmail(token);
		return redirect('/profile/settings');
	} catch (error) {
		return json({ error });
	}
	// TODO  - implement error page
};
