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
		.min(2, 'Name must be at least 2 characters long'),
});

export default function AccountInformation() {
	const [initiating, setInitiating] = useState(false);

	const { initializeClusterSetup } = useClusterStore();
	const { setUser } = useAuthStore();
	const navigate = useNavigate();

	const { setStepByPath } = useOnboardingStore();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setInitiating(true);
		const res = await initializeClusterSetup(data);

		if ('error' in res) {
			alert(res.details);
		} else {
			setUser(res);
			navigate('/onboarding/create-organization');

			setStepByPath('/onboarding', {
				isDone: true,
			});
		}

		setInitiating(false);
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
									<Input
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
								<FormDescription>Minimum 2 characters</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='flex justify-end'>
						<Button loading={initiating} className='w-[165px]'>
							Next
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

AccountInformation.loader = loader;
