import { SettingsFormItem } from 'components/SettingsFormItem';
import { CopyInput } from 'components/CopyInput';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { translate } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APIError, VersionProperties } from '@/types';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { useParams } from 'react-router-dom';
import { Switch } from 'components/Switch';
import { EndpointRateLimiters } from '@/features/version/SettingsGeneral';

const FormSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('version.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('version.name') }))
		.max(64, translate('forms.max64.error', { label: translate('version.name') }))
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('version.name'),
			}),
		),
});

export default function SettingsGeneral() {
	const { version, updateVersionProperties } = useVersionStore();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);

	const params = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();

	async function update(data: Partial<VersionProperties>) {
		const { orgId, versionId, appId } = params;
		if (!orgId || !versionId || !appId) return;

		try {
			await updateVersionProperties({ orgId, versionId, appId, ...data });
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
			setError(e as APIError);
		}
	}

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: version?.name,
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		if (version?.name === data.name) return;

		try {
			setLoading(true);
			setError(null);
			await update({ name: data.name });
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.updated.name'),
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='divide-y'>
			<SettingsFormItem
				className='space-y-0 py-0 pb-6'
				contentClassName='pt-6'
				title={t('version.settings.version_id')}
				description={t('version.settings.version_id_desc')}
			>
				<CopyInput readOnly value={version?.iid} />
			</SettingsFormItem>
			<SettingsFormItem
				className='space-y-0 py-6'
				contentClassName='pt-6'
				title={t('version.settings.version_name')}
				description={t('version.settings.version_name_desc')}
			>
				{error && (
					<Alert variant='error'>
						<AlertTitle>{error.error}</AlertTitle>
						<AlertDescription>{error.details}</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.name)}
											placeholder={t('profileSettings.name_placeholder') ?? ''}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.max64.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='mt-4'>
							<Button loading={loading} size='lg'>
								{t('profileSettings.save')}
							</Button>
						</div>
					</form>
				</Form>
			</SettingsFormItem>
			<SettingsFormItem
				twoColumns
				className='space-y-0 py-6'
				contentClassName='flex items-center justify-end'
				title={t('version.read_only')}
				description={t('version.settings.read_only_desc')}
			>
				<Switch
					checked={version?.readOnly}
					onCheckedChange={(checked) => update({ readOnly: checked })}
				/>
			</SettingsFormItem>
			{!version?.master && (
				<SettingsFormItem
					className='space-y-0 py-6'
					contentClassName='pt-6'
					title={t('version.private')}
					description={t('version.settings.private_desc')}
				>
					<Switch
						disabled={version?.master}
						checked={version?.private}
						onCheckedChange={(checked) => update({ private: checked })}
					/>
				</SettingsFormItem>
			)}
			<SettingsFormItem
				className='space-y-0 py-0 pt-6'
				contentClassName='pt-6'
				title={t('version.settings.endpoint_rate_limit')}
				description={t('version.settings.endpoint_rate_limit_desc')}
			>
				<EndpointRateLimiters />
			</SettingsFormItem>
		</div>
	);
}
