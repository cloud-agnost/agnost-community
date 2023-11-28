import { SettingsFormItem } from '@/components/SettingsFormItem';
import { useAuthorizeVersion } from '@/hooks';
import { Switch } from '@/components/Switch';
import { useTranslation } from 'react-i18next';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { useParams } from 'react-router-dom';
import { AutoRedeploy } from '../AutoRedeploy';
export default function AutoDeploy() {
	const { t } = useTranslation();

	return (
		<SettingsFormItem
			className='space-y-0 pb-6 pt-0'
			contentClassName='flex items-center justify-end'
			twoColumns
			title={t('version.auto_deploy')}
			description={t('version.auto_redeploy_desc')}
		>
			<AutoRedeploy />
		</SettingsFormItem>
	);
}
