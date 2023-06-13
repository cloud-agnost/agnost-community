import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';
import { VerificationCodeInput } from '@/components/VerificationCodeInput';
import { useSearchParams } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

async function loader(params: any) {
	console.log(params);
	return null;
}

const FormSchema = z.object({
	code: z
		.string({ required_error: 'Verification code is required' })
		.max(6, 'Verification code must be 6 digits')
		.min(6, 'Verification code must be 6 digits')
		.transform((val) => Number(val)),
});

export default function VerifyEmail() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);

	const { verifyEmail } = useAuthStore();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const email = searchParams.get('email');
		if (!email) return;
		try {
			setError(null);
			setLoading(true);
			await verifyEmail(email, data.code);
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Verify Your Email'>
					We&apos;ve sent a six-digit confirmation code to{' '}
					<span className='text-default'>{searchParams.get('email')}</span>. Please enter your code
					below to activate your account.
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
							name='code'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormControl>
										<VerificationCodeInput error={!!form.formState.errors.code} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Description>
							Keep this window open while checking for your code. If you haven&apos;t received our
							email, please check your spam folder.
						</Description>

						<div className='flex justify-end gap-4'>
							<Button loading={loading} size='lg'>
								Verify
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	);
}

VerifyEmail.loader = loader;
