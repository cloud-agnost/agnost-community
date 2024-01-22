import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AddNPMPackagesDrawer } from '@/features/version/SettingsNPMPackages';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

export default function AddNPMPackagesButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canAdd = useAuthorizeVersion('version.package.create');

	return (
		<>
			<Button disabled={!canAdd} onClick={() => setOpen(true)}>
				{t('version.npm.install')}
			</Button>
			<AddNPMPackagesDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
