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
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setError(null);
		console.log(data);
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Forgot Password'>
					Don’t worry! Fill in your email address you use to sign in to Agnost and we’ll send you a
					link to reset your password.
				</Description>

				{error && (
					<Alert className='!max-w-full' variant='error'>
						{error}
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
							<Button className='w-[165px]'>Get Reset Link</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

ForgotPassword.loader = loader;
