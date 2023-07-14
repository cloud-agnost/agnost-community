import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';
import { AddAPIKeyDrawer } from '@/features/version/SettingsAPIKeys';

export default function AddAPIKeyButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>{t('version.api_key.add')}</Button>
			<AddAPIKeyDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
