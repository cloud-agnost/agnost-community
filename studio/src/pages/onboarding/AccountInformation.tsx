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
import { translate } from '@/utils';
import { useTranslation } from 'react-i18next';

async function loader() {
	return null;
}

const FormSchema = z.object({
	email: z
		.string({
			required_error: translate('forms.required', {
				label: translate('login.email'),
			}),
		})
		.email(translate('forms.email.error')),
	password: z
		.string({
			required_error: translate('forms.required', {
				label: translate('login.password'),
			}),
		})
		.min(8, {
			message: translate('forms.min8.error', { label: translate('login.password') }),
		}),
	name: z
		.string({
			required_error: translate('forms.required', { label: translate('login.name') }),
		})
		.min(2, {
			message: translate('forms.min2.error', { label: translate('login.name') }),
		})
		.max(64, {
			message: translate('forms.max64.error', { label: translate('login.name') }),
		})
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', { label: translate('login.name') }),
		),
});

export default function AccountInformation() {
	const [initiating, setInitiating] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const { goToNextStep } = useOnboardingStore();
	const { initializeClusterSetup } = useClusterStore();
	const { setUser } = useAuthStore();
	const { t } = useTranslation();
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
				{t('onboarding.welcome')}
			</h1>
			<Description title={t('onboarding.account_info')}>{t('onboarding.welcome_desc')}</Description>

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
								<FormLabel>{t('login.email')}</FormLabel>
								<FormControl>
									<Input
										error={Boolean(form.formState.errors.email)}
										type='email'
										placeholder={t('login.enter_email') as string}
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
								<FormLabel>{t('login.password')}</FormLabel>
								<FormControl>
									<PasswordInput
										error={Boolean(form.formState.errors.password)}
										type='password'
										placeholder={t('login.enter_password') as string}
										{...field}
									/>
								</FormControl>
								<FormDescription>{t('forms.min8.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('login.name')}</FormLabel>
								<FormControl>
									<Input
										error={Boolean(form.formState.errors.name)}
										placeholder={t('login.enter_name') as string}
										{...field}
									/>
								</FormControl>
								<FormDescription>{t('forms.max64.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='flex justify-end'>
						<Button loading={initiating} size='lg'>
							{t('onboarding.next')}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

AccountInformation.loader = loader;
