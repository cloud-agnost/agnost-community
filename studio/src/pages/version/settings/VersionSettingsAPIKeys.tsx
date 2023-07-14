import { SettingsContainer } from '@/features/version/SettingsContainer';
import {
	AddOrEditAPIKeyDrawer,
	APIKeysActions,
	SettingsAPIKeys,
} from '@/features/version/SettingsAPIKeys';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { APIKey } from '@/types';
import { useTranslation } from 'react-i18next';
import useVersionStore from '@/store/version/versionStore.ts';

export default function VersionSettingsAPIKeys() {
	const { t } = useTranslation();
	const { editAPIKeyDrawerIsOpen, setEditAPIKeyDrawerIsOpen } = useVersionStore();
	const [selectedRows, setSelectedRows] = useState<Row<APIKey>[]>();

	return (
		<SettingsContainer
			action={<APIKeysActions selectedRows={selectedRows} />}
			className='table-view'
			pageTitle={t('version.settings.api_keys')}
		>
			<SettingsAPIKeys setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
			<AddOrEditAPIKeyDrawer
				open={editAPIKeyDrawerIsOpen}
				onOpenChange={setEditAPIKeyDrawerIsOpen}
				editMode
			/>
		</SettingsContainer>
	);
}
