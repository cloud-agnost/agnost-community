import { Button } from '@/components/Button';
import { useAuthorizeVersion } from '@/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddVersionDomain } from '.';
import useClusterStore from '@/store/cluster/clusterStore';
import _ from 'lodash';

export default function AddCustomDomainButton() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('domain.create');
	const { clusterDomainError } = useClusterStore();
	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				disabled={!canCreate || !_.isNil(clusterDomainError)}
				size='xs'
			>
				{t('cluster.add_domain')}
			</Button>
			<AddVersionDomain key={open.toString()} open={open} onClose={() => setOpen(false)} />
		</>
	);
}
