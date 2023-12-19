import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import {
	APIKeysActions,
	AddOrEditAPIKeyDrawer,
	SettingsAPIKeysColumns,
} from '@/features/version/SettingsAPIKeys';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTable } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore';
import { APIKey } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsAPIKeys() {
	const { t } = useTranslation();

	const apiKeys = useVersionStore((state) => state.version?.apiKeys ?? []);
	const { editAPIKeyDrawerIsOpen, setEditAPIKeyDrawerIsOpen } = useSettingsStore();

	const table = useTable({
		data: apiKeys,
		columns: SettingsAPIKeysColumns,
	});

	return (
		<SettingsContainer
			action={<APIKeysActions table={table} />}
			className='table-view'
			pageTitle={t('version.settings.api_keys')}
		>
			{apiKeys.length > 0 ? (
				<>
					<div className='data-table-container'>
						<DataTable<APIKey> table={table} className='table-fixed navigator' />
					</div>
					<AddOrEditAPIKeyDrawer
						key={editAPIKeyDrawerIsOpen.toString()}
						open={editAPIKeyDrawerIsOpen}
						onOpenChange={setEditAPIKeyDrawerIsOpen}
						editMode
					/>
				</>
			) : (
				<EmptyState type='apiKey' title={t('version.api_key.no_api_key_found')} />
			)}
		</SettingsContainer>
	);
}
