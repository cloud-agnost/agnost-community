import { ChangeNameForm } from '@/components/ChangeNameForm';
import { EndpointRateLimiters } from '@/features/version/SettingsGeneral';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError, VersionProperties } from '@/types';
import { translate } from '@/utils';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { CopyInput } from 'components/CopyInput';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Switch } from 'components/Switch';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';

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
	const { environment } = useEnvironmentStore();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const canEdit = useAuthorizeVersion('version.update');
	const params = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();

	async function update(data: Partial<VersionProperties>) {
		const { orgId, versionId, appId } = params;
		if (!orgId || !versionId || !appId) return;

		await updateVersionProperties({
			orgId,
			versionId,
			appId,
			...data,
			onSuccess: () => {
				notify({
					type: 'success',
					title: t('general.success'),
					description: t('version.limiter_added_to_default'),
				});
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
				setError(error);
			},
		});
	}

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
				<CopyInput readOnly value={`${window.location.origin}/${environment.iid}`} />
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
				<ChangeNameForm
					onFormSubmit={onSubmit}
					loading={loading}
					error={error}
					defaultValue={version?.name as string}
					disabled={!canEdit}
				/>
			</SettingsFormItem>
			<SettingsFormItem
				twoColumns
				className='space-y-0 py-6'
				contentClassName='flex items-center justify-end'
				title={t('version.read_only')}
				description={t('version.settings.read_only_desc')}
			>
				<Switch
					disabled={!canEdit}
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
						disabled={version?.master ?? !canEdit}
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
