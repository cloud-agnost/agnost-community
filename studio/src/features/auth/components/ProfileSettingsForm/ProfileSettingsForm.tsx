import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/auth/authStore.ts';
import { CopyInput } from 'components/CopyInput';
import { ChangeName } from '@/features/auth/components/ChangeName';
import { ChangeEmail } from '@/features/auth/components/ChangeEmail';
import { ChangePassword } from '@/features/auth/components/ChangePassword';
import { ProfileSettingsFormItem } from '@/features/auth/components/ProfileSettingsForm';
import { DeleteAccount } from '@/features/auth/components/DeleteAccount';
import { ChangeAvatar } from '@/features/auth/components/ChangeAvatar';

export default function ProfileSettingsForm() {
	const { t } = useTranslation();
	const { user } = useAuthStore();

	return (
		<div className='divide-y last:border-b'>
			<ProfileSettingsFormItem
				title={t('profileSettings.your_user_id')}
				description={t('profileSettings.your_user_id_description')}
			>
				<CopyInput readOnly value={user?.iid} />
			</ProfileSettingsFormItem>
			<ProfileSettingsFormItem
				title={t('profileSettings.your_name')}
				description={t('profileSettings.your_name_description')}
			>
				<ChangeName />
			</ProfileSettingsFormItem>
			<ProfileSettingsFormItem
				title={t('profileSettings.your_email')}
				description={t('profileSettings.your_email_description')}
			>
				<ChangeEmail />
			</ProfileSettingsFormItem>

			<ProfileSettingsFormItem
				title={t('profileSettings.password')}
				description={t('profileSettings.your_password_description')}
			>
				<ChangePassword />
			</ProfileSettingsFormItem>
			<ProfileSettingsFormItem
				title={t('profileSettings.your_avatar')}
				description={t('profileSettings.your_avatar_description')}
			>
				<ChangeAvatar />
			</ProfileSettingsFormItem>

			<ProfileSettingsFormItem
				title={t('profileSettings.delete_account')}
				description={t('profileSettings.delete_account_description')}
			>
				<DeleteAccount />
			</ProfileSettingsFormItem>
		</div>
	);
}
