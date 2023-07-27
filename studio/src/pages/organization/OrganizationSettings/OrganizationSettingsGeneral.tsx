import { CopyInput } from '@/components/CopyInput';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import {
	ChangeOrganizationAvatar,
	ChangeOrganizationName,
	DeleteOrganization,
	TransferOrganization,
} from '@/features/organization';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useTranslation } from 'react-i18next';

export default function OrganizationSettingsGeneral() {
	const { t } = useTranslation();
	const { organization } = useOrganizationStore();
	return (
		<OrganizationSettingsLayout title='General'>
			<SettingsFormItem
				title={t('organization.settings.id.title')}
				description={t('organization.settings.id.desc')}
			>
				<CopyInput readOnly value={organization?.iid} />
			</SettingsFormItem>
			<SettingsFormItem
				title={t('organization.settings.name.title')}
				description={t('organization.settings.name.desc')}
			>
				<ChangeOrganizationName />
			</SettingsFormItem>
			<SettingsFormItem
				title={t('organization.settings.avatar.title')}
				description={t('organization.settings.avatar.desc')}
			>
				<ChangeOrganizationAvatar />
			</SettingsFormItem>
			<SettingsFormItem
				title={t('organization.settings.transfer.title')}
				description={t('organization.settings.transfer.desc')}
			>
				<TransferOrganization />
			</SettingsFormItem>
			<SettingsFormItem
				title={t('organization.settings.delete.title')}
				description={t('organization.settings.delete.desc')}
			>
				<DeleteOrganization />
			</SettingsFormItem>
		</OrganizationSettingsLayout>
	);
}
