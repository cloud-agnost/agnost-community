import useAuthStore from '@/store/auth/authStore';
import { APIError } from '@/types';
import { LoaderFunctionArgs, json, redirect } from 'react-router-dom';

async function changePasswordWithTokenLoader({ request }: LoaderFunctionArgs) {
	const token = new URL(request.url).searchParams.get('token');
	if (!token) {
		return redirect('/login');
	}

	return token;
}

async function completeAccountSetupVerifyEmail(params: LoaderFunctionArgs) {
	const url = new URL(params.request.url);
	const token = url.searchParams.get('token');
	const isVerified = url.searchParams.has('isVerified');
	try {
		const isAccepted = useAuthStore.getState().isAccepted;
		let res;
		if (token && !isAccepted) res = await useAuthStore.getState().acceptInvite(token as string);
		return { token, isVerified, user: res?.user };
	} catch (error) {
		if ((error as APIError).code === 'not_allowed') return redirect('/login');
		else return { error, token, isVerified };
	}
}

async function confirmChangeEmailLoader({ request }: LoaderFunctionArgs) {
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
}

export default {
	changePasswordWithTokenLoader,
	completeAccountSetupVerifyEmail,
	confirmChangeEmailLoader,
};
