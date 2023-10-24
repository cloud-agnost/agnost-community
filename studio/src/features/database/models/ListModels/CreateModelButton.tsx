import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { EditOrCreateModelDrawer } from '@/features/database/models/ListModels/index.ts';

export default function CreateModelButton() {
	const { t } = useTranslation();
	const canCreateModel = useAuthorizeVersion('model.create');

	return (
		<EditOrCreateModelDrawer editMode={false}>
			<Button className='gap-2 whitespace-nowrap' disabled={!canCreateModel}>
				<Plus weight='bold' />
				{t('database.models.create')}
			</Button>
		</EditOrCreateModelDrawer>
	);
}
