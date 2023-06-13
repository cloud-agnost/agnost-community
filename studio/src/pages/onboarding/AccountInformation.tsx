import { Description } from '@/components/Description';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';
import { PasswordInput } from '@/components/PasswordInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { APIError } from '@/types';
import { User } from '@/types/type';

async function loader() {
	return null;
}

const FormSchema = z.object({
	email: z
		.string({ required_error: 'Email address is required' })
		.email('Please enter a valid email address'),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters long'),
	name: z
		.string({ required_error: 'Name is required' })
		.min(2, 'Name must be at least 2 characters long')
		.max(64, 'Name must be at most 64 characters long'),
});

export default function AccountInformation() {
	const [initiating, setInitiating] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const { goToNextStep } = useOnboardingStore();
	const { initializeClusterSetup } = useClusterStore();
	const { setUser } = useAuthStore();
	const navigate = useNavigate();

	const { getCurrentStep } = useOnboardingStore();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setInitiating(true);
			setError(null);
			const user = await initializeClusterSetup(data);
			setUser(user as User);
			const { nextPath } = getCurrentStep();
			console.log(nextPath);
			if (nextPath) {
				console.log(nextPath);
				navigate(nextPath);
				goToNextStep(true);
			}
		} catch (e) {
			setError(e as APIError);
		} finally {
			setInitiating(false);
		}
	}

	return (
		<>
			<h1 className='text-default font-semibold text-[1.625rem] leading-[2.75rem] text-center'>
				Welcome to Agnost Enterprise Cluster
			</h1>
			<Description title='Account Information'>
				Through this onboarding flow, we will help you set up your cluster and create your
				organization and first app. Please follow the succeeding steps to complete your cluster set
				up and start building your apps.
			</Description>

			{error && (
				<Alert className='!max-w-full' variant='error'>
					<AlertTitle>{error.error}</AlertTitle>
					<AlertDescription>{error.details}</AlertDescription>
				</Alert>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
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
								<FormControl>
									<Input
										error={Boolean(form.formState.errors.name)}
										placeholder='Enter your name'
										{...field}
									/>
								</FormControl>
								<FormDescription>Maximum 64 characters</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='flex justify-end'>
						<Button loading={initiating} size='lg'>
							Next
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

AccountInformation.loader = loader;
