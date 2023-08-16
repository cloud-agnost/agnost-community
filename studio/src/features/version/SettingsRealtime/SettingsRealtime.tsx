import './SettingsRealtime.scss';

import { Switch } from 'components/Switch';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { APIError, VersionRealtimeProperties } from '@/types';
import { useToast } from '@/hooks';
import { RealtimeRateLimits } from '@/features/version/SettingsRealtime';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

export default function SettingsRealtime() {
	const realtime = useVersionStore((state) => state.version?.realtime);
	const { version, updateVersionRealtimeProperties } = useVersionStore();
	const canEdit = useAuthorizeVersion('version.update');
	const { notify } = useToast();
	const { t } = useTranslation();

	async function update(data: Partial<VersionRealtimeProperties>) {
		if (!version) return;

		try {
			await updateVersionRealtimeProperties({
				versionId: version._id,
				orgId: version.orgId,
				appId: version.appId,
				...data,
			});
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		}
	}

	return (
		<div className='divide-y'>
			<SettingsFormItem
				twoColumns
				className='space-y-0 py-6 pt-0'
				contentClassName='flex items-center justify-end'
				title={t('version.realtime.activate_realtime')}
				description={t('version.realtime.activate_realtime_desc')}
			>
				<Switch onCheckedChange={(enabled) => update({ enabled })} checked={realtime?.enabled} />
			</SettingsFormItem>
			<SettingsFormItem
				twoColumns
				className='space-y-0 py-6'
				contentClassName='flex items-center justify-end'
				title={t('version.realtime.api_key_required')}
				description={t('version.realtime.api_key_required_desc')}
			>
				<Switch
					disabled={!canEdit}
					onCheckedChange={(apiKeyRequired) => update({ apiKeyRequired })}
					checked={realtime?.apiKeyRequired}
				/>
			</SettingsFormItem>
			<SettingsFormItem
				twoColumns
				className='space-y-0 py-6'
				contentClassName='flex items-center justify-end'
				title={t('version.realtime.session_required')}
				description={t('version.realtime.session_required_desc')}
			>
				<Switch
					disabled={!canEdit}
					onCheckedChange={(sessionRequired) => update({ sessionRequired })}
					checked={realtime?.sessionRequired}
				/>
			</SettingsFormItem>
			<SettingsFormItem
				className='space-y-0 py-0 pt-6'
				contentClassName='pt-6'
				title={t('version.realtime.rate_limiter')}
				description={t('version.realtime.rate_limiter_desc')}
			>
				<RealtimeRateLimits />
			</SettingsFormItem>
		</div>
	);
}
