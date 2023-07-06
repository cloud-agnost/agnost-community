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
import { useTranslation } from 'react-i18next';

async function loader() {
	return null;
}

const FormSchema = z.object({
	host: z
		.string({ required_error: 'Host is required' })
		.trim()
		.refine((value) => value.trim().length > 0, 'Host is required'),
	port: z
		.string({ required_error: 'Port is required' })
		.regex(/^[0-9]+$/, 'Port must be a number')
		.min(3, 'Port must be at least 3 characters long')
		.trim()
		.refine((value) => value.trim().length > 0, 'Port is required'),
	user: z
		.string({ required_error: 'Username is required' })
		.trim()
		.refine((value) => value.trim().length > 0, 'Username is required'),
	password: z.string({ required_error: 'Password is required' }),
	useTLS: z.boolean(),
});

export default function SMTPConfiguration() {
	const [error, setError] = useState<APIError | null>(null);
	const [isTesting, setIsTesting] = useState(false);
	const [finalizing, setFinalizing] = useState(false);
	const { t } = useTranslation();

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
			<Description title={t('onboarding.smtp.title')}>{t('onboarding.smtp.desc')}</Description>

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
								<FormLabel>{t('onboarding.smtp.host')}</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.host}
										placeholder={t('onboarding.smtp.enter_host').toString()}
										{...field}
									/>
								</FormControl>
								<FormDescription>{t('onboarding.smtp.host_desc')}</FormDescription>
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
									<FormLabel>{t('onboarding.smtp.port')}</FormLabel>
									<FormControl>
										<Input
											error={!!form.formState.errors.port}
											placeholder={t('onboarding.smtp.enter_port').toString()}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('onboarding.smtp.port_desc')}</FormDescription>
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
								<FormLabel>{t('onboarding.smtp.username')}</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.user}
										placeholder={t('onboarding.smtp.enter_username').toString()}
										{...field}
									/>
								</FormControl>
								<FormDescription>{t('onboarding.smtp.username_desc')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('onboarding.smtp.password')}</FormLabel>
								<FormControl>
									<PasswordInput
										error={Boolean(form.formState.errors.password)}
										type='password'
										placeholder={t('onboarding.smtp.enter_password').toString()}
										{...field}
									/>
								</FormControl>
								<FormDescription>{t('onboarding.smtp.password_desc')}</FormDescription>

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
									<FormLabel>{t('onboarding.smtp.useTLS')}</FormLabel>
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

					<div className='flex gap-4 justify-end'>
						<Button onClick={goBack} type='button' variant='text' size='lg'>
							{t('onboarding.previous')}
						</Button>
						<Button
							loading={finalizing}
							onClick={finishSetup}
							type='button'
							variant='secondary'
							size='lg'
						>
							{t('onboarding.skip_and_finish')}
						</Button>
						<Button loading={isTesting} size='lg'>
							{t('onboarding.next')}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

SMTPConfiguration.loader = loader;
