import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
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
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { Switch } from '@/components/Switch';
import { PlatformService } from '@/services';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';
import { APIError } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import * as z from 'zod';

async function loader() {
	return null;
}

const FormSchema = z.object({
	host: z.string({ required_error: 'Host is required' }),
	port: z
		.string({ required_error: 'Port is required' })
		.regex(/^[0-9]+$/, 'Port must be a number')
		.min(3, 'Port must be at least 3 characters long'),
	user: z.string({ required_error: 'Username is required' }),
	password: z.string({ required_error: 'Password is required' }),
	useTLS: z.boolean(),
});

export default function SMTPConfiguration() {
	const [error, setError] = useState<APIError | null>(null);
	const [isTesting, setIsTesting] = useState(false);
	const [finalizing, setFinalizing] = useState(false);

	const {
		setDataPartially,
		getCurrentStep,
		goToNextStep,
		setStepByPath,
		data: onboardingData,
	} = useOnboardingStore();

	const { finalizeClusterSetup } = useClusterStore();
	const { goBack } = useOutletContext() as { goBack: () => void };

	const navigate = useNavigate();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			...onboardingData.smtp,
			port: onboardingData.smtp.port,
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setIsTesting(true);
			setError(null);
			await PlatformService.testSMTPSettings(data);
			const { nextPath } = getCurrentStep();
			setDataPartially({
				smtp: data,
			});
			if (nextPath) {
				navigate(nextPath);
				goToNextStep(true);
			}
		} catch (error) {
			setError(error as APIError);
		} finally {
			setIsTesting(false);
		}
	}

	async function finishSetup() {
		try {
			setFinalizing(true);
			await finalizeClusterSetup(onboardingData);
			setFinalizing(false);
			setStepByPath('/onboarding/smtp-configuration', {
				isDone: true,
			});
			navigate('/organization');
		} catch (error) {
			setError(error as APIError);
		}
	}

	return (
		<>
			<Description title='SMTP Configuration'>
				In order to send invitation emails, you need to configure your SMTP server (email server)
				connection parameters. This email server configuration will be used to send organization and
				application invitations and also other platform-related notification messages.
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
						name='host'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Host</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.host}
										placeholder='Enter hostname'
										{...field}
									/>
								</FormControl>
								<FormDescription>The hostname or IP address to connect to</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='port'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Port</FormLabel>
									<FormControl>
										<Input
											error={!!form.formState.errors.port}
											placeholder='Enter port'
											{...field}
										/>
									</FormControl>
									<FormDescription>The port to connect to</FormDescription>
									<FormMessage />
								</FormItem>
							);
						}}
					/>

					<FormField
						control={form.control}
						name='user'
						render={({ field }) => (
							<FormItem>
								<FormLabel>User</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.user}
										placeholder='Enter username'
										{...field}
									/>
								</FormControl>
								<FormDescription>Username for authentication</FormDescription>
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
								<FormDescription>The password for the user</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='useTLS'
						render={({ field }) => {
							console.log(field);
							return (
								<FormItem className='flex items-center gap-2'>
									<FormLabel>Use TLS</FormLabel>
									<FormControl>
										{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
										{/* @ts-ignore */}
										<Switch className='flex !m-0' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>

					<div className='flex gap-1 justify-end'>
						<Button onClick={goBack} type='button' variant='text' size='lg'>
							Previous
						</Button>
						<Button
							loading={finalizing}
							onClick={finishSetup}
							type='button'
							variant='secondary'
							size='lg'
						>
							Skip & Finish
						</Button>
						<Button loading={isTesting} size='lg'>
							Next
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

SMTPConfiguration.loader = loader;
