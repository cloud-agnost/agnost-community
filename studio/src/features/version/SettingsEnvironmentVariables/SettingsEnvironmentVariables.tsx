import {
	EditOrAddVariableDrawer,
	VariableColumns,
} from '@/features/version/SettingsEnvironmentVariables';
import useVersionStore from '@/store/version/versionStore.ts';
import { Param } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsEnvironmentVariables.scss';
import useSettingsStore from '@/store/version/settingsStore';

interface SettingsEnvironmentVariablesProps {
	selectedRows: Row<Param>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Param>[] | undefined>>;
	setTable: Dispatch<SetStateAction<Table<Param> | undefined>>;
}

export default function SettingsEnvironmentVariables({
	setSelectedRows,
	setTable,
}: SettingsEnvironmentVariablesProps) {
	const { t } = useTranslation();
	const variables = useVersionStore((state) => state.version?.params ?? []);
	const { setEditParamDrawerIsOpen, editParamDrawerIsOpen } = useSettingsStore();

	return (
		<>
			{variables.length === 0 ? (
				<div className='h-full flex items-center justify-center'>
					<EmptyState type='variable' title={t('version.variable.no_variable_found')} />
				</div>
			) : (
				<div className='data-table-container'>
					<DataTable<Param>
						columns={VariableColumns}
						setTable={setTable}
						data={variables}
						setSelectedRows={setSelectedRows}
						noDataMessage={<p className='text-xl'>{t('version.variable.no_variable_found')}</p>}
					/>
				</div>
			)}
			<EditOrAddVariableDrawer
				open={editParamDrawerIsOpen}
				editMode
				onOpenChange={setEditParamDrawerIsOpen}
			/>
		</>
	);
}
