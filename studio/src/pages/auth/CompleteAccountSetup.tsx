import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { AuthLayout } from '@/layouts/AuthLayout';
import useAuthStore from '@/store/auth/authStore';
import { APIError } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import './auth.scss';

async function loader(params: any) {
	console.log(params);
	return null;
}

const FormSchema = z.object({
	email: z
		.string({ required_error: 'Email address is required' })
		.email('Please enter a valid email address'),
});

export default function CompleteAccountSetup() {
	const navigate = useNavigate();
	const [error, setError] = useState<APIError | null>(null);
	const [loading, setLoading] = useState(false);
	const { initiateAccountSetup } = useAuthStore();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setLoading(true);
		await initiateAccountSetup(
			data.email,
			() => {
				navigate('verify-email');
				setLoading(false);
			},
			(e) => {
				setError(e as APIError);
				setLoading(false);
			},
		);
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Complete Account Setup'>
					If you have been invited to an organization or an app and accepted the invitation, then
					you might have an account with an incomplete setup (e.g., mission password, name). Please
					enter your email to start completing your account set up.
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
											placeholder='Enter email address'
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
							<Button size='lg' loading={loading}>
								Continue
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

CompleteAccountSetup.loader = loader;
