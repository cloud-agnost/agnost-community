import { Alert } from '@/components/Alert';
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

// TODO: remove default values from schema after testing
const FormSchema = z.object({
	host: z.string({ required_error: 'Host is required' }).default('smtp.mandrillapp.com'),
	port: z
		.string({ required_error: 'Port is required' })
		.regex(/^[0-9]+$/, 'Port must be a number')
		.min(3, 'Port must be at least 3 characters long')
		.transform((val) => Number(val))
		.default('587'),
	user: z.string({ required_error: 'Username is required' }).default('Altogic'),
	password: z.string({ required_error: 'Password is required' }).default('iS-pNHmBJIXIpjOUXgYmZQ'),
	useTLS: z.boolean().default(false),
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
	async function checkSMTPConnection(data: z.infer<typeof FormSchema>): Promise<boolean> {
		setIsTesting(true);
		setError(null);

		const res = await PlatformService.testSMTPSettings(data);
		setIsTesting(false);
		if (typeof res === 'object' && 'error' in res) {
			setError(res);
			return false;
		} else {
			setDataPartially({
				smtp: data,
			});
			navigate('/onboarding/invite-team-members');

			setStepByPath('/onboarding/smtp-configuration', {
				isDone: true,
			});
			return true;
		}
	}

	async function finishSetup() {
		try {
			setFinalizing(true);
			await finalizeClusterSetup(onboardingData);
			setFinalizing(false);
			setStepByPath;
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
					{error.details}
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
											type='number'
											error={!!form.formState.errors.port}
											placeholder='Enter port'
											{...form.register('port', { valueAsNumber: true })}
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
						render={({ field }) => (
							<FormItem className='flex items-center gap-2'>
								<FormLabel>Use TLS</FormLabel>
								<FormControl>
									{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
									{/* @ts-ignore */}
									<Switch className='flex !m-0' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex gap-1 justify-end'>
						<Button onClick={goBack} type='button' variant='text' className='w-[165px]'>
							Previous
						</Button>
						<Button
							loading={finalizing}
							onClick={finishSetup}
							type='button'
							variant='secondary'
							className='w-[165px]'
						>
							Skip & Finish
						</Button>
						<Button loading={isTesting} className='w-[165px]'>
							Next
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

SMTPConfiguration.loader = loader;
