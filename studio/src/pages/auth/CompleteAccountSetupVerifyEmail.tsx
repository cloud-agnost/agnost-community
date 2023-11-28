import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { VerificationCodeInput } from '@/components/VerificationCodeInput';
import { AuthLayout } from '@/layouts/AuthLayout';
import useAuthStore from '@/store/auth/authStore';
import { APIError, User } from '@/types/type.ts';
import { translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import * as z from 'zod';
import './auth.scss';
interface CompleteAccountSetupVerifyEmailLoaderData {
	token?: string;
	isVerified?: boolean;
	user?: User;
	error: APIError | null;
}

const FormSchema = z.object({
	verificationCode: z
		.string()
		.max(6, translate('forms.verificationCode.length.error'))
		.min(6, translate('forms.verificationCode.length.error'))
		.optional()
		.or(z.literal(''))
		.transform((val) => Number(val))
		.superRefine((val, ctx) => {
			const url = new URL(window.location.href);
			const token = url.searchParams.has('token');
			if (!token && !val) {
				return ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: translate('forms.required', {
						label: translate('login.verification_code'),
					}),
					path: ['verificationCode'],
				});
			}
		}),
	password: z
		.string({
			required_error: translate('forms.required', {
				label: translate('login.password'),
			}),
		})
		.min(
			8,
			translate('forms.min8.error', {
				label: translate('login.name'),
			}),
		),
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('login.name'),
			}),
		})
		.min(
			2,
			translate('forms.min2.error', {
				label: translate('login.name'),
			}),
		)
		.max(
			64,
			translate('forms.max64.error', {
				label: translate('login.name'),
			}),
		)
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('login.name'),
			}),
		),
});

export default function CompleteAccountSetupVerifyEmail() {
	const {
		token,
		isVerified,

		error: loaderError,
	} = useLoaderData() as CompleteAccountSetupVerifyEmailLoaderData;
	const [error, setError] = useState<APIError | null>(loaderError);
	const [loading, setLoading] = useState(false);
	const { completeAccountSetup, finalizeAccountSetup, email, user } = useAuthStore();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});
	const { t } = useTranslation();

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setError(null);
			setLoading(true);

			if (!token) {
				await finalizeAccountSetup({
					email: email as string,
					verificationCode: data.verificationCode,
					name: data.name,
					password: data.password,
				});
			} else {
				await completeAccountSetup({
					email: user?.loginProfiles[0].email,
					token,
					name: data.name,
					password: data.password,
					inviteType: 'app',
				});
			}
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (error && error.code === 'invalid_validation_code') {
			form.setError('verificationCode', {
				message: '',
			});
		}
	}, [error]);

	useEffect(() => {
		return () => {
			useAuthStore.setState({ isAccepted: false });
		};
	}, []);
	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title={t('login.complete_account_setup')} />

				{(error || isVerified) && (
					<Alert className='!max-w-full' variant={isVerified && !error ? 'success' : 'error'}>
						<AlertTitle>
							{isVerified && !error ? t('login.you_have_been_added') : error?.error}
						</AlertTitle>
						<AlertDescription>
							{isVerified && !error ? t('login.complete_account_setup_desc') : error?.details}
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						{!isVerified && (
							<FormField
								control={form.control}
								name='verificationCode'
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('login.verification_code')}</FormLabel>
										<FormControl>
											<VerificationCodeInput
												error={Boolean(form.formState.errors.verificationCode)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('login.password')}</FormLabel>
									<FormDescription>{t('login.password_desc')}</FormDescription>
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.password)}
											type='password'
											placeholder={t('login.password') as string}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.min8.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('login.name')}</FormLabel>
									<FormDescription>{t('login.name_desc')}</FormDescription>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.name)}
											placeholder={t('login.enter_name') as string}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.max64.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end'>
							<Button loading={loading} size='lg'>
								{t('login.complete_setup')}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}
