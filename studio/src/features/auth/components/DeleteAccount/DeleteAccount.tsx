import { Button } from 'components/Button';

import './deleteAccount.scss';
import { useTranslation } from 'react-i18next';

export default function DeleteAccount() {
	const { t } = useTranslation();
	return (
		<div>
			<Button className='delete-account-btn' variant='secondary'>
				{t('profileSettings.delete')}
			</Button>
		</div>
	);
}
