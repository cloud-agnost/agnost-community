import { Button } from '@/components/Button';
import { CreateRateLimit } from '@/features/version/SettingsGeneral';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddRateLimitButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type='button' onClick={() => setOpen(true)}>
				{t('version.add_new_limiter')}
			</Button>
			<CreateRateLimit open={open} onOpenChange={setOpen} />
		</>
	);
}
