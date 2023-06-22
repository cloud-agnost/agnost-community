import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Button } from '@/components/Button';
import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import './auth.scss';
import { APIError } from '@/types';
import useAuthStore from '@/store/auth/authStore.ts';
import { PasswordInput } from '@/components/PasswordInput';
import { Link, LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

const FormSchema = z.object({
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters long'),
});

export default function ChangePasswordWithToken() {
	const { changePasswordWithToken } = useAuthStore();
	const token = useLoaderData() as string;
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const [success, setSuccess] = useState(false);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setError(null);
			setLoading(true);
			setSuccess(false);
			await changePasswordWithToken(token, data.password);
			setSuccess(true);
			form.reset();
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Change Your Password'>
					Enter your new password below to change your password.
				</Description>

				{error && (
					<Alert className='!max-w-full' variant='error'>
						<AlertTitle>{error.error}</AlertTitle>
						<AlertDescription>{error.details}</AlertDescription>
					</Alert>
				)}

				{success ? (
					<div className='space-y-8'>
						<Alert className='!max-w-full mb-8' variant='success'>
							<AlertTitle>Your password has been changed successfully.</AlertTitle>
							<AlertDescription>You can now login with your new password.</AlertDescription>
						</Alert>
						<Link
							to='/login'
							className='text-default hover:underline mt-4 flex items-center justify-center'
						>
							<CaretLeft className='mr-1 inline-block' />
							Back to Login
						</Link>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='auth-form'>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<PasswordInput
												error={Boolean(form.formState.errors.password)}
												placeholder='Enter your new password'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='flex justify-end gap-4'>
								<Button to='/login' variant='text' type='button' size='lg'>
									Back to Login
								</Button>
								<Button loading={loading} size='lg'>
									Change Password
								</Button>
							</div>
						</form>
					</Form>
				)}
			</div>
		</AuthLayout>
	);
}

ChangePasswordWithToken.loader = ({ request }: LoaderFunctionArgs) => {
	const token = new URL(request.url).searchParams.get('token');
	if (!token) {
		return redirect('/login');
	}

	return token;
};
