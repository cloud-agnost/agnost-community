import './SettingsEnvironmentVariables.scss';
import { Param } from '@/types';
import { DataTable } from 'components/DataTable';
import useVersionStore from '@/store/version/versionStore.ts';
import { Row, Table } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
	EditOrAddVariableDrawer,
	VariableColumns,
} from '@/features/version/SettingsEnvironmentVariables';
import { EmptyState } from 'components/EmptyState';
import { EnvironmentVariable } from '@/components/icons';

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
	const { setEditParamDrawerIsOpen, editParamDrawerIsOpen } = useVersionStore();

	return (
		<>
			{variables.length === 0 ? (
				<div className='h-full flex items-center justify-center'>
					<EmptyState
						icon={<EnvironmentVariable className='w-44 h-44' />}
						title={t('version.variable.no_variable_found')}
					/>
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
