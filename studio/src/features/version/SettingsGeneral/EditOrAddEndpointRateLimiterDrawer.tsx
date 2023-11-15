import { NUMBER_REGEX } from '@/constants';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError, RateLimit } from '@/types';
import { translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Button } from 'components/Button';
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
import { Input } from 'components/Input';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
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
			NUMBER_REGEX,
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
			NUMBER_REGEX,
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
	editMode?: boolean;
	addToDefault?: 'realtime' | 'endpoint';
	onCreate?: (limiter: RateLimit) => void;
}

export default function EditOrAddEndpointRateLimiterDrawer({
	open,
	onOpenChange,
	editMode = false,
	addToDefault,
	onCreate,
}: AddEndpointRateLimiterDrawerProps) {
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const { t } = useTranslation();
	const [error, setError] = useState<APIError | null>(null);
	const canEdit = useAuthorizeVersion('version.limit.create');
	const { createRateLimit, updateVersionRealtimeProperties, rateLimit, editRateLimit } =
		useSettingsStore();
	const { updateVersionProperties } = useVersionStore();
	const defaultEndpointLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const realtimeEndpoints = useVersionStore((state) => state.version?.realtime?.rateLimits);

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	useEffect(() => {
		if (!open) form.reset();
		else if (rateLimit && editMode) {
			form.setValue('name', rateLimit.name);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			form.setValue('rate', rateLimit.rate.toString());
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			form.setValue('duration', rateLimit.duration.toString());
			form.setValue('errorMessage', rateLimit.errorMessage);
		}
	}, [open, rateLimit]);

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
			if (editMode) {
				await edit(orgId, appId, versionId, data);
			} else {
				await add(orgId, appId, versionId, data);
			}
			onOpenChange(false);
			form.reset();
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
	}

	async function add(
		orgId: string,
		appId: string,
		versionId: string,
		data: z.infer<typeof FormSchema>,
	) {
		const rateLimit = await createRateLimit({
			orgId,
			versionId,
			appId,
			name: data.name,
			rate: data.rate,
			duration: data.duration,
			errorMessage: data.errorMessage,
		});
		if (addToDefault === 'endpoint') {
			await updateVersionProperties({
				orgId,
				versionId,
				appId,
				defaultEndpointLimits: [...(defaultEndpointLimits ?? []), rateLimit.iid],
				onError: (error) => {
					notify({
						type: 'error',
						title: t('general.error'),
						description: error.details,
					});
				},
			});
		}
		if (addToDefault === 'realtime') {
			await updateVersionRealtimeProperties({
				orgId,
				versionId,
				appId,
				rateLimits: [...(realtimeEndpoints ?? []), rateLimit.iid],
			});
		}
		if (!addToDefault) {
			onCreate?.(rateLimit);
		}
	}

	async function edit(
		orgId: string,
		appId: string,
		versionId: string,
		data: z.infer<typeof FormSchema>,
	) {
		if (!rateLimit) return;
		await editRateLimit({
			orgId,
			versionId,
			appId,
			name: data.name,
			rate: data.rate,
			duration: data.duration,
			errorMessage: data.errorMessage,
			limitId: rateLimit?._id,
		});
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>
						{editMode ? t('version.edit_rate_limiter') : t('version.add_rate_limiter')}
					</DrawerTitle>
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
								<Button
									disabled={loading || !canEdit}
									loading={loading}
									size='lg'
									type='button'
									onClick={() => {
										form.handleSubmit(onSubmit)();
									}}
								>
									{editMode ? t('general.save') : t('general.create')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}