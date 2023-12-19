import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import {
	EditEnvVariable,
	VariableActions,
	VariableColumns,
} from '@/features/version/SettingsEnvironmentVariables';
import { useTable } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore';
import { Param } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsEnvironmentVariables() {
	const { t } = useTranslation();
	const variables = useVersionStore((state) => state.version?.params ?? []);
	const { setEditParamDrawerIsOpen, editParamDrawerIsOpen } = useSettingsStore();

	const table = useTable({
		data: variables.sort((a, b) => a.name.localeCompare(b.name)),
		columns: VariableColumns,
	});

	return (
		<SettingsContainer
			pageTitle={t('version.settings.environment_variables')}
			action={<VariableActions table={table} />}
			className='table-view'
		>
			<>
				{variables.length === 0 ? (
					<div className='h-full flex items-center justify-center'>
						<EmptyState type='variable' title={t('version.variable.no_variable_found')} />
					</div>
				) : (
					<div className='data-table-container'>
						<DataTable<Param> table={table} className='table-fixed navigator' />
					</div>
				)}
				<EditEnvVariable open={editParamDrawerIsOpen} onOpenChange={setEditParamDrawerIsOpen} />
			</>
		</SettingsContainer>
	);
}
