import { Button } from '@/components/Button';
import { CreateRateLimit } from '@/features/version/SettingsGeneral';
import { useAuthorizeVersion } from '@/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddRateLimitButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('version.limit.create');
	return (
		<>
			<Button type='button' onClick={() => setOpen(true)} disabled={!canCreate}>
				{t('version.add_new_limiter')}
			</Button>
			<CreateRateLimit open={open} onOpenChange={setOpen} />
		</>
	);
}
