import { LoaderFunctionArgs, redirect } from 'react-router-dom';

const REDIRECT_URLS = {
	'app-invite': '/complete-account-setup/verify-email?token=:token&isVerified=true',
	'org-invite': '/org-invite?token=:token',
	'change-email': '/change-email?token=:token',
	'reset-pwd': '/forgot-password/:token',
};

function loader(params: LoaderFunctionArgs) {
	const url = new URL(params.request.url);
	const token = url.searchParams.get('token');
	const type = url.searchParams.get('type');

	if (!type || !token) {
		return redirect('/login');
	}

	return redirect(REDIRECT_URLS[type as keyof typeof REDIRECT_URLS].replace(':token', token));
}

export default function RedirectHandle() {
	return null;
}

RedirectHandle.loader = loader;
