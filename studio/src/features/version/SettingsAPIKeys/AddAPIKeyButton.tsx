import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { AddOrEditAPIKeyDrawer } from '@/features/version/SettingsAPIKeys';
import { useAuthorizeVersion } from '@/hooks';

export default function AddAPIKeyButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('version.key.create');
	return (
		<>
			<Button onClick={() => setOpen(true)} disabled={!canCreate} size='xs'>
				{t('version.api_key.add')}
			</Button>
			<AddOrEditAPIKeyDrawer key={open.toString()} open={open} onOpenChange={setOpen} />
		</>
	);
}
