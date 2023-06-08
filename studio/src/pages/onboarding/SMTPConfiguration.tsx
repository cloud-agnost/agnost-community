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
import { Checkbox } from '@/components/Checkbox';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';

async function loader() {
	return null;
}

const FormSchema = z.object({
	host: z.string({ required_error: 'Host is required' }),
	port: z
		.string({ required_error: 'Port is required' })
		.regex(/^[0-9]+$/, 'Port must be a number')
		.min(3, 'Port must be at least 3 characters long')
		.transform((val) => Number(val)),
	user: z.string({ required_error: 'Username is required' }),
	password: z.string({ required_error: 'Password is required' }),
	useTLS: z.boolean().optional().default(false),
});

export default function SMTPConfiguration() {
	const { setDataPartially, setStepByPath } = useOnboardingStore();
	const { finalizeClusterSetup } = useClusterStore();
	const { goBack } = useOutletContext() as { goBack: () => void };

	const navigate = useNavigate();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		setDataPartially({
			smtp: data,
		});
		navigate('/onboarding/invite-team-members');
		setStepByPath('/onboarding/smtp-configuration', {
			isDone: true,
		});
	}

	function finishSetup() {
		alert();
		finalizeClusterSetup();
	}

	return (
		<>
			<Description title='SMTP Configuration'>
				In order to send invitation emails, you need to configure your SMTP server (email server)
				connection parameters. This email server configuration will be used to send organization and
				application invitations and also other platform-related notification messages.
			</Description>

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
									<Input
										error={!!form.formState.errors.password}
										placeholder='Enter password'
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
							<FormItem>
								<FormLabel>Use TLS</FormLabel>
								<FormControl>
									{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
									{/* @ts-ignore */}
									<Checkbox {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex gap-1 justify-end'>
						<Button onClick={goBack} type='button' variant='text' className='w-[165px]'>
							Previous
						</Button>
						<Button onClick={finishSetup} type='button' variant='secondary' className='w-[165px]'>
							Skip & Finish
						</Button>
						<Button className='w-[165px]'>Next</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

SMTPConfiguration.loader = loader;
