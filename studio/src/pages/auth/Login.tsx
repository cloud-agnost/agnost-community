import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Alert } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Button } from '@/components/Button';
import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import './auth.scss';
import { Link } from 'react-router-dom';

async function loader(params: any) {
	console.log(params);
	return null;
}

const FormSchema = z.object({
	email: z
		.string({ required_error: 'Email address is required' })
		.email('Please enter a valid email address'),
	password: z.string({ required_error: 'Password is required' }),
});

export default function Login() {
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
				<Description title='Login to your account'>
					Welcome back! Please enter your details.
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
							<Button size='full'>Login</Button>
						</div>
					</form>
				</Form>

				<div className='flex justify-between text-sm underline text-default leading-6 font-albert'>
					<Link to='/forgot-password'>Forgot Password</Link>
					<Link to='/complete-account-setup'>Complete Account Setup</Link>
				</div>
			</div>
		</AuthLayout>
	);
}

Login.loader = loader;
