import { Button } from '@/components/Button';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateEnvVariable from './CreateEnvVariable';

export default function AddVariableButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('version.param.create');
	return (
		<>
			<Button disabled={!canCreate} onClick={() => setOpen(true)}>
				{t('version.variable.add')}
			</Button>
			<CreateEnvVariable open={open} onOpenChange={setOpen} />
		</>
	);
}
