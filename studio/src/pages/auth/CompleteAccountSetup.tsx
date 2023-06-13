import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';
import { Alert, AlertDescription } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import { useNavigate } from 'react-router-dom';

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
	const [error, setError] = useState<APIError | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { completeAccountSetup } = useAuthStore();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setError(null);
			setLoading(true);
			await completeAccountSetup(data.email);
			navigate(`/complete-account-setup/verify-email?email=${data.email}`);
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
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

						<div className='flex justify-end gap-1'>
							<Button to='/login' variant='text' type='button' className='w-[165px]'>
								Back to Login
							</Button>
							<Button loading={loading} className='w-[165px]'>
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
