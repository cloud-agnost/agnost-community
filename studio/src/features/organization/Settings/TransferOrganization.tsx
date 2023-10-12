import { TransferOwnership } from '@/components/TransferOwnership';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function TransferOrganization() {
	const [userId, setUserId] = useState<string>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { organization, transferOrganization } = useOrganizationStore();
	const { notify } = useToast();
	const navigate = useNavigate();
	const { t } = useTranslation();
	function transferOrganizationHandle() {
		setLoading(true);
		transferOrganization({
			organizationId: organization?._id,
			userId: userId as string,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('organization.transfer-success'),
					type: 'success',
				});
				setTimeout(() => {
					navigate(`/organization`);
				}, 2000);
			},
			onError: (err) => {
				setError(err);
				setLoading(false);
			},
		});
	}
	return (
		<TransferOwnership
			transferOwnership={transferOrganizationHandle}
			error={error as APIError}
			loading={loading}
			setUserId={setUserId}
			userId={userId as string}
		/>
	);
}
