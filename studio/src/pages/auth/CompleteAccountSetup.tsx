import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
				<Description title='Complete Account Setup'>
					If you have been invited to an organization or an app and accepted the invitation, then
					you might have an account with an incomplete setup (e.g., mission password, name). Please
					enter your email to start completing your account set up.
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
							<Button className='w-[165px]'>Continue</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

CompleteAccountSetup.loader = loader;
