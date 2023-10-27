import { Button } from 'components/Button';

import './deleteAccount.scss';
import { Trans, useTranslation } from 'react-i18next';
import useAuthStore from '@/store/auth/authStore.ts';
import { useState } from 'react';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { APIError } from '@/types';
import { resetAllStores } from '@/helpers';

export default function DeleteAccount() {
	const { t } = useTranslation();
	const [error, setError] = useState<null | APIError>(null);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const confirmCode = useAuthStore((state) => state.user?.iid) as string;
	const { deleteAccount, logout } = useAuthStore();
	const navigate = useNavigate();

	function closeModal() {
		setIsOpen(false);
		setError(null);
	}

	function openModal() {
		setIsOpen(true);
	}

	async function onConfirm() {
		setLoading(true);
		setError(null);
		await deleteAccount();
		logout({
			onSuccess: () => {
				navigate('/login');
				resetAllStores();
				setLoading(false);
			},
			onError(error) {
				setError(error as APIError);
				setLoading(false);
			},
		});
	}

	return (
		<>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('profileSettings.delete_my_account')}
				alertTitle={t('profileSettings.delete_account_alert_title')}
				alertDescription={t('profileSettings.delete_account_alert_description')}
				description={
					<Trans
						i18nKey='profileSettings.delete_confirm_description'
						values={{ confirmCode }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={confirmCode}
				onConfirm={onConfirm}
				isOpen={isOpen}
				closeModal={closeModal}
				closable
			/>
			<div>
				<Button onClick={openModal} className='delete-account-btn' variant='secondary'>
					{t('profileSettings.delete')}
				</Button>
			</div>
		</>
	);
}
