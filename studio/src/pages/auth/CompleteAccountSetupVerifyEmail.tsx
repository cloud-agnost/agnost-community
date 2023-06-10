import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
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

async function loader(params: any) {
	console.log(params);
	return null;
}

const FormSchema = z.object({
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters long'),
	name: z
		.string({ required_error: 'Name is required' })
		.min(2, 'Name must be at least 2 characters long'),
});

export default function CompleteAccountSetupVerifyEmail() {
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
				<Description title='Complete Account Setup' />

				{error && (
					<Alert className='!max-w-full' variant='error'>
						{error}
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<div className='text-default'>
							{/* TODO :: Code input buraya gelecek hazır değil */}
							Code input buraya gelecek hazır değil
						</div>

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
							<Button className='w-[165px]'>Complete Setup</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

CompleteAccountSetupVerifyEmail.loader = loader;
