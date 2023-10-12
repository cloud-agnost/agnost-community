import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Form } from '@/components/Form';
import { SMTPForm } from '@/components/SMTPForm';
import { RequireAuth } from '@/router';
import { PlatformService } from '@/services';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';
import { APIError, SMTPSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import * as z from 'zod';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
export default function SMTPConfiguration() {
	const [error, setError] = useState<APIError | null>(null);
	const [isTesting, setIsTesting] = useState(false);
	const [finalizing, setFinalizing] = useState(false);
	const { t } = useTranslation();

	const Schema = z.object({
		fromEmail: z.string({ required_error: 'Email is required' }).email(),
		fromName: z.string().optional(),
		...SMTPSchema.shape,
	});

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
	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			...onboardingData.smtp,
		},
	});

	async function onSubmit(data: z.infer<typeof Schema>) {
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
		<RequireAuth>
			<>
				<Description title={t('onboarding.smtp.title')}>{t('onboarding.smtp.desc')}</Description>

				{error && (
					<Alert className='!max-w-full' variant='error'>
						<AlertTitle>{error.error}</AlertTitle>
						<AlertDescription>{error.details}</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3.5'>
						<FormField
							control={form.control}
							name='fromName'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('onboarding.smtp.fromName')}</FormLabel>
									<FormControl>
										<Input
											error={!!form.formState.errors.host}
											placeholder={t('onboarding.smtp.enter_fromName').toString()}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('onboarding.smtp.fromName_desc')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='fromEmail'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('onboarding.smtp.fromEmail')}</FormLabel>
									<FormControl>
										<Input
											error={!!form.formState.errors.host}
											placeholder={t('onboarding.smtp.enter_fromEmail').toString()}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('onboarding.smtp.fromEmail_desc')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<SMTPForm />
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
		</RequireAuth>
	);
}
