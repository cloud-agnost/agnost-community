import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AuthService } from '@/services';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore';
import { APIError } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';
import './auth.scss';

const FormSchema = z.object({
	email: z
		.string({ required_error: 'Email address is required' })
		.email('Please enter a valid email address'),
	password: z.string({ required_error: 'Password is required' }),
});

export default function Login() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const { login, setUser } = useAuthStore();
	const { canClusterSendEmail } = useClusterStore();
	const navigate = useNavigate();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit({ email, password }: z.infer<typeof FormSchema>) {
		try {
			setError(null);
			setLoading(true);
			const user = await login(email, password);
			setUser(user);
			navigate('/organization');
		} catch (error) {
			setError(error as APIError);
		} finally {
			setLoading(false);
		}
	}

	if (error?.code === 'pending_email_confirmation') {
		return <NotVerified clearError={() => setError(null)} email={form.getValues().email} />;
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Login to your account'>
					Welcome back! Please enter your details.
				</Description>
				{error && (
					<Alert className='!max-w-full' variant='error'>
						<AlertTitle>{error.error}</AlertTitle>
						<AlertDescription>{error.details}</AlertDescription>
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
											error={Boolean(form.formState.errors.email)}
											type='email'
											placeholder='Enter email address'
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
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.password)}
											type='password'
											placeholder='Enter Password'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex justify-end space-y-8'>
							<Button loading={loading} size='full'>
								Login
							</Button>
						</div>
					</form>
				</Form>
				{canClusterSendEmail && (
					<div className='flex justify-between text-sm underline text-default leading-6 font-albert'>
						<Link to='/forgot-password'>Forgot Password</Link>
						<Link to='/complete-account-setup'>Complete Account Setup</Link>
					</div>
				)}
			</div>
		</AuthLayout>
	);
}

function NotVerified({ email, clearError }: { email: string; clearError: () => void }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const navigate = useNavigate();
	async function reSendVerificationCode() {
		try {
			setError(null);
			setLoading(true);
			await AuthService.resendEmailVerificationCode(email);
			navigate(`/verify-email?email=${email}`);
		} catch (error) {
			setError(error as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Email Verification'>
					Your email address has not been verified yet. You need to first verify your email to
					activate your Agnost account.
				</Description>

				<Description className='!mt-2'>
					Click button below to send the email verification code to{' '}
					<span className='text-default'>{email}</span>
				</Description>

				{error && (
					<Alert className='!max-w-full' variant='error'>
						<AlertTitle>{error.error}</AlertTitle>
						<AlertDescription>{error.details}</AlertDescription>
					</Alert>
				)}

				<div className='flex justify-end gap-1'>
					<Button onClick={clearError} variant='text' type='button' size='lg'>
						Back to Login
					</Button>
					<Button loading={loading} onClick={reSendVerificationCode}>
						Send Verify Code
					</Button>
				</div>
			</div>
		</AuthLayout>
	);
}
