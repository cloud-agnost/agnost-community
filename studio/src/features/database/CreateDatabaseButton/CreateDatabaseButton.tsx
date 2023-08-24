import { Button } from 'components/Button';
import { useState } from 'react';
import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { useTranslation } from 'react-i18next';

export default function CreateDatabaseButton() {
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('db.create');
	const { t } = useTranslation();
	return (
		<>
			<Button onClick={() => setOpen(true)} disabled={!canCreate}>
				{t('database.add.title')}
			</Button>
			<CreateAndEditDatabaseDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
