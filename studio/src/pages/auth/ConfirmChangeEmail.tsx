import { Card } from '@/components/Card';
import { Error, SuccessCheck } from '@/components/icons';
import { AuthLayout } from '@/layouts/AuthLayout';
import useAuthStore from '@/store/auth/authStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function ConfirmChangeEmail() {
	const { confirmChangeLoginEmail } = useAuthStore();
	const [searchParams] = useSearchParams();
	const {
		mutateAsync: confirmEmail,
		error,
		isSuccess,
		isPending,
	} = useMutation({
		mutationFn: confirmChangeLoginEmail,
	});
	const { t } = useTranslation();
	const Icon = isSuccess ? SuccessCheck : Error;
	const title = isSuccess ? t('profileSettings.email_updated_success') : error?.error;
	const description = isSuccess
		? t('profileSettings.email_updated_success_description')
		: error?.details;

	useEffect(() => {
		confirmEmail(searchParams.get('token'));
	}, []);
	return (
		<AuthLayout>
			<div className='flex flex-col items-center justify-center h-full'>
				{isPending ? (
					<BeatLoader color='#6884FD' size={24} margin={18} />
				) : (
					<div className='flex flex-col items-center p-8 space-y-4'>
						<Icon className='h-24 w-24' />
						<h2 className='text-3xl font-semibold text-default'>{title}</h2>
						<p className='text-subtle'>{description}</p>
					</div>
				)}
			</div>
		</AuthLayout>
	);
}
