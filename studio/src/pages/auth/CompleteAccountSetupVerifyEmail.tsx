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
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';
import * as z from 'zod';
import './auth.scss';
interface CompleteAccountSetupVerifyEmailLoaderData {
	token?: string;
	isVerified?: boolean;
	user?: User;
	error: APIError | null;
}
async function loader(params: LoaderFunctionArgs) {
	try {
		const url = new URL(params.request.url);
		const token = url.searchParams.get('token');
		const isVerified = JSON.parse(url.searchParams.get('isVerified') || 'false');
		let res;
		if (token) res = await useAuthStore.getState().acceptInvite(token as string);
		return { token, isVerified, user: res?.user };
	} catch (error) {
		if ((error as APIError).code === 'not_allowed') return redirect('/login');
		else return error;
	}
}

const FormSchema = z.object({
	verificationCode: z
		.string()
		.max(6, 'Verification code must be 6 digits')
		.min(6, 'Verification code must be 6 digits')
		.optional()
		.or(z.literal(''))
		.transform((val) => Number(val))
		.superRefine((val, ctx) => {
			const url = new URL(window.location.href);
			const token = url.searchParams.has('token');
			if (!token && !val) {
				return ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Verification code is required',
					path: ['verificationCode'],
				});
			}
		}),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters long'),
	name: z
		.string({ required_error: 'Name is required' })
		.min(2, 'Name must be at least 2 characters long')
		.max(64, 'Name must be at most 64 characters long'),
});

export default function CompleteAccountSetupVerifyEmail() {
	const {
		token,
		isVerified,
		user,
		error: loaderError,
	} = useLoaderData() as CompleteAccountSetupVerifyEmailLoaderData;

	const [error, setError] = useState<APIError | null>(loaderError);
	const [loading, setLoading] = useState(false);

	const { completeAccountSetup, finalizeAccountSetup, email } = useAuthStore();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

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
			console.log({
				catch: e,
			});
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		console.log({ error });
		if (error && error.code === 'invalid_validation_code') {
			form.setError('verificationCode', {
				message: '',
			});
		}
	}, [error]);

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Complete Account Setup' />

				{(error || isVerified) && (
					<Alert className='!max-w-full' variant={isVerified && !error ? 'success' : 'error'}>
						<AlertTitle>
							{isVerified && !error ? 'You have been successfully added.' : error?.error}
						</AlertTitle>
						<AlertDescription>
							{isVerified && !error
								? 'Complete your personal account setup to access the Agnost platform. Logging in requires a completed account setup.'
								: error?.details}
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
										<FormLabel>Verification Code</FormLabel>
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
									<FormLabel>Password</FormLabel>
									<FormDescription>
										When signing in your account you can use either your email and your password
									</FormDescription>
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.password)}
											type='password'
											placeholder='Enter Password'
											{...field}
										/>
									</FormControl>
									<FormDescription>Minimum 8 characters</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormDescription>
										Please enter your full name, or a display name you are comfortable with.
									</FormDescription>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.name)}
											placeholder='Enter your name'
											{...field}
										/>
									</FormControl>
									<FormDescription>Maximum 64 characters</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end'>
							<Button loading={loading} size='lg'>
								Complete Setup
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

CompleteAccountSetupVerifyEmail.loader = loader;
