import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AddMiddlewareDrawer } from '@/features/version/Middlewares';

export default function AddMiddlewareButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>{t('version.middleware.add_middleware')}</Button>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
