import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APIError } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';

export default function DeleteOrganization() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>();
	const [isOpen, setIsOpen] = useState(false);
	const confirmCode = useOrganizationStore((state) => state.organization?.iid) as string;
	const { deleteOrganization } = useOrganizationStore();
	const canDelete = useAuthorizeOrg('delete');
	function onConfirm() {
		deleteOrganization({
			onSuccess: () => {
				closeModal();
				navigate('/organization');
			},
			onError: (error) => {
				setError(error as APIError);
			},
		});
	}
	function closeModal() {
		setLoading(false);
		setIsOpen(false);
		setError(null);
	}
	return (
		<>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error?.error}</AlertTitle>
					<AlertDescription>{error?.details}</AlertDescription>
				</Alert>
			)}
			<Button variant='destructive' onClick={() => setIsOpen(true)} size='lg' disabled={!canDelete}>
				{t('general.delete')}
			</Button>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('organization.settings.delete.title')}
				alertTitle={t('organization.settings.delete.confirm.title')}
				alertDescription={t('organization.settings.delete.confirm.desc')}
				description={
					<Trans
						i18nKey='organization.settings.delete.confirm.code'
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
		</>
	);
}
