import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { EditOrCreateModelDrawer } from '@/features/database/models/ListModels/index.ts';
import { useState } from 'react';

export default function CreateModelButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className='gap-2 whitespace-nowrap'>
				<Plus weight='bold' />
				{t('database.models.create')}
			</Button>

			<EditOrCreateModelDrawer open={open} onOpenChange={() => setOpen(false)} />
		</>
	);
}
