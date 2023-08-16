import { AddMiddlewareDrawer } from '@/features/version/Middlewares';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { Button } from 'components/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddMiddlewareButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCraeteMiddleware = useAuthorizeVersion('middleware.create');
	return (
		<>
			<Button type='button' onClick={() => setOpen(true)} disabled={!canCraeteMiddleware}>
				{t('version.middleware.add_middleware')}
			</Button>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
