import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { EditOrAddVariableDrawer } from '@/features/version/SettingsEnvironmentVariables';

export default function AddVariableButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>{t('version.variable.add')}</Button>
			<EditOrAddVariableDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
