import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/components/PasswordInput';
import { VerificationCodeInput } from '@/components/VerificationCodeInput';
import useAuthStore from '@/store/auth/authStore.ts';
import { LoaderFunctionArgs, redirect, useSearchParams } from 'react-router-dom';
import { APIError } from '@/types';

async function loader(params: LoaderFunctionArgs) {
	const url = new URL(params.request.url);

	if (!url.searchParams.has('email')) {
		return redirect('/complete-account-setup');
	}

	return null;
}

const FormSchema = z.object({
	verificationCode: z
		.string({ required_error: 'Verification code is required' })
		.max(6, 'Verification code must be 6 digits')
		.min(6, 'Verification code must be 6 digits')
		.transform((val) => Number(val)),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters long'),
	name: z
		.string({ required_error: 'Name is required' })
		.min(2, 'Name must be at least 2 characters long'),
});

export default function CompleteAccountSetupVerifyEmail() {
	const [error, setError] = useState<APIError | null>(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [params] = useSearchParams();
	const { finalizeAccountSetup } = useAuthStore();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	console.log(params.get('email'));

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const email = params.get('email');
		if (!email) return;
		try {
			setError(null);
			setLoading(true);
			setSuccess(false);
			await finalizeAccountSetup({ ...data, email });
			setSuccess(true);
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Complete Account Setup' />

				{error && (
					<Alert className='!max-w-full' variant='error'>
						<AlertDescription>{error.details}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='!max-w-full' variant='success'>
						<AlertTitle>You have been successfully added to the Atlassian team</AlertTitle>
						<AlertDescription>
							Complete your personal account setup to access the Agnost platform. Logging in
							requires a completed account setup.
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='verificationCode'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormControl>
										<VerificationCodeInput
											error={!!form.formState.errors.verificationCode}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
									<FormDescription>Minimum 2 characters</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end'>
							<Button loading={loading} className='w-[165px]'>
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
