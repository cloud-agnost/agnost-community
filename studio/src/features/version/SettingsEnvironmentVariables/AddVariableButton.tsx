import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { EditOrAddVariableDrawer } from '@/features/version/SettingsEnvironmentVariables';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

export default function AddVariableButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('version.param.create');
	return (
		<>
			<Button disabled={!canCreate} onClick={() => setOpen(true)}>
				{t('version.variable.add')}
			</Button>
			<EditOrAddVariableDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
