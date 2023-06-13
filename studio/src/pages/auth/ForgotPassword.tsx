import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Alert } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import './auth.scss';
import { APIError } from '@/types';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore.ts';

async function loader(params: any) {
	console.log(params);
	return null;
}

const FormSchema = z.object({
	email: z
		.string({ required_error: 'Email address is required' })
		.email('Please enter a valid email address'),
});

export default function ForgotPassword() {
	const { resetPassword } = useAuthStore();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<APIError | null>(null);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setError(null);
			setLoading(true);
			setSuccess(false);
			await resetPassword(data.email);
			setSuccess(true);
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className='flex justify-center items-center flex-col min-h-screen text-center text-subtle px-4'>
				<div className='w-[172px] h-[172px] rounded-2xl bg-text-subtle mb-12'></div>
				<h1 className='text-default font-semibold leading-[44px] text-[26px] mb-2'>
					Password reset message sent
				</h1>
				<div className='flex flex-col gap-6 leading-6 font-normal'>
					<p>
						Link and instructions for resetting your password have been sent to{' '}
						<span className='block text-default'>{form.getValues().email}</span>
					</p>
					<p>If you don’t receive it right away, please check your spam folder</p>
					<p className='font-albert'>
						Contact our support team if you have an issue when resetting your password.{' '}
						<Link className='text-default underline' to='/contact'>
							Contact Us
						</Link>
					</p>
				</div>
				<Link className='text-default text-xs mt-14' to='/login'>
					Back To Login
				</Link>
			</div>
		);
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Forgot Password'>
					Don’t worry! Fill in your email address you use to sign in to Agnost and we’ll send you a
					link to reset your password.
				</Description>

				{error && error.code !== 'invalid_credentials' && (
					<Alert className='!max-w-full' variant='error'>
						{error.details}
					</Alert>
				)}

				{success && (
					<Alert className='!max-w-full' variant='success'>
						Password reset link sent to your email address
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='auth-form'>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											error={
												Boolean(form.formState.errors.email) ||
												error?.code === 'invalid_credentials'
											}
											type='email'
											placeholder='Enter email address'
											{...field}
										/>
									</FormControl>
									<FormMessage>
										{form.formState.errors.email?.message || error?.details}
									</FormMessage>
								</FormItem>
							)}
						/>

						<div className='flex justify-end gap-1'>
							<Button to='/login' variant='text' type='button' size='lg'>
								Back to Login
							</Button>
							<Button loading={loading} size='lg'>
								Get Reset Link
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

ForgotPassword.loader = loader;
