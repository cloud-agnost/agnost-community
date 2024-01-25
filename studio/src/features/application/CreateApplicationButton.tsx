import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';

export default function CreateApplicationButton() {
	const { t } = useTranslation();
	const canAppCreate = useAuthorizeOrg('app.create');
	const { openAppCreateModal } = useOutletContext<{
		openAppCreateModal: () => void;
	}>();
	return (
		<Button variant='primary' onClick={openAppCreateModal} disabled={!canAppCreate}>
			<Plus size={14} className='mr-1 text-icon-default' />
			{t('application.create')}
		</Button>
	);
}
