import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { translate } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APIError } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';

const FormSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('version.add.rate_limiter.name.label_lower'),
			}),
		})
		.min(
			2,
			translate('forms.min2.error', {
				label: translate('version.add.rate_limiter.name.label_lower'),
			}),
		)
		.max(
			64,
			translate('forms.max64.error', {
				label: translate('version.add.rate_limiter.name.label_lower'),
			}),
		)
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('version.add.rate_limiter.name.label_lower'),
			}),
		),
	rate: z
		.string({
			required_error: translate('forms.required', {
				label: translate('version.add.rate_limiter.rate.label_lower'),
			}),
		})
		.regex(
			/^[0-9]+$/,
			translate('forms.number', {
				label: translate('version.add.rate_limiter.rate.label_lower'),
			}),
		)
		.transform((val) => Number(val)),
	duration: z
		.string({
			required_error: translate('forms.required', {
				label: translate('version.add.rate_limiter.duration.label_lower'),
			}),
		})
		.regex(
			/^[0-9]+$/,
			translate('forms.number', {
				label: translate('version.add.rate_limiter.duration.label_lower'),
			}),
		)
		.transform((val) => Number(val)),
	errorMessage: z.string({
		required_error: translate('forms.required', {
			label: translate('version.add.rate_limiter.error_message.label_lower'),
		}),
	}),
});

interface AddEndpointRateLimiterDrawerProps {
	open?: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddEndpointRateLimiterDrawer({
	open,
	onOpenChange,
}: AddEndpointRateLimiterDrawerProps) {
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	const [error, setError] = useState<APIError | null>(null);
	const createRateLimit = useVersionStore((state) => state.createRateLimit);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
	const defaultEndpointLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);

	const { notify } = useToast();

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			errorMessage: t('version.add.rate_limiter.error_message.default').toString(),
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		if (!versionId || !appId || !orgId) return;
		try {
			setLoading(true);
			setError(null);
			const rateLimit = await createRateLimit({
				orgId,
				versionId,
				appId,
				name: data.name,
				rate: data.rate,
				duration: data.duration,
				errorMessage: data.errorMessage,
			});
			await updateVersionProperties({
				orgId,
				versionId,
				appId,
				defaultEndpointLimits: [...(defaultEndpointLimits ?? []), rateLimit.iid],
			});
			onOpenChange(false);
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.add.rate_limiter.success'),
			});
			form.reset();
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.add_rate_limiter')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
							{error && (
								<Alert variant='error'>
									<AlertTitle>{error.error}</AlertTitle>
									<AlertDescription>{error.details}</AlertDescription>
								</Alert>
							)}
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('version.add.rate_limiter.name.label')}</FormLabel>
										<FormControl>
											<Input
												className='bg-transparent'
												error={Boolean(form.formState.errors.name)}
												type='text'
												placeholder={t('version.add.rate_limiter.name.placeholder') as string}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('forms.max64.description')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='rate'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('version.add.rate_limiter.rate.label')}</FormLabel>
										<FormControl>
											<Input
												className='bg-transparent'
												error={Boolean(form.formState.errors.rate)}
												type='number'
												placeholder={t('version.add.rate_limiter.rate.placeholder') as string}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('version.add.rate_limiter.rate.desc')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='duration'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('version.add.rate_limiter.duration.label')}</FormLabel>
										<FormControl></FormControl>
										<Input
											className='bg-transparent'
											error={Boolean(form.formState.errors.duration)}
											type='number'
											placeholder={t('version.add.rate_limiter.duration.placeholder') as string}
											{...field}
										/>
										<FormDescription>{t('version.add.rate_limiter.duration.desc')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='errorMessage'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('version.add.rate_limiter.error_message.label')}</FormLabel>
										<FormControl>
											<Input
												className='bg-transparent'
												error={Boolean(form.formState.errors.errorMessage)}
												type='text'
												placeholder={
													t('version.add.rate_limiter.error_message.placeholder') as string
												}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											{t('version.add.rate_limiter.error_message.desc')}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className='mt-4 flex justify-end'>
								<Button loading={loading} size='lg'>
									{t('general.create')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
