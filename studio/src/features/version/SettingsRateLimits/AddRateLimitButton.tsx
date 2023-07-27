import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { EditOrAddEndpointRateLimiterDrawer } from '@/features/version/SettingsGeneral';

export default function AddMiddlewareButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type='button' onClick={() => setOpen(true)}>
				{t('version.add_new_limiter')}
			</Button>
			<EditOrAddEndpointRateLimiterDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
