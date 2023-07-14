import './SettingsEnvironmentVariables.scss';
import { Param } from '@/types';
import { DataTable } from 'components/DataTable';
import useVersionStore from '@/store/version/versionStore.ts';
import { Row } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
	EditOrAddVariableDrawer,
	VariableColumns,
} from '@/features/version/SettingsEnvironmentVariables';

interface SettingsEnvironmentVariablesProps {
	selectedRows: Row<Param>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Param>[] | undefined>>;
}

export default function SettingsEnvironmentVariables({
	setSelectedRows,
}: SettingsEnvironmentVariablesProps) {
	const { t } = useTranslation();
	const variables = useVersionStore((state) => state.version?.params ?? []);
	const { setEditParamDrawerIsOpen, editParamDrawerIsOpen } = useVersionStore();

	return (
		<>
			<div className='data-table-container'>
				<DataTable<Param>
					columns={VariableColumns}
					data={variables}
					setSelectedRows={setSelectedRows}
					noDataMessage={<p className='text-xl'>{t('version.variable.no_variable_found')}</p>}
				/>
			</div>
			<EditOrAddVariableDrawer
				open={editParamDrawerIsOpen}
				editMode
				onOpenChange={setEditParamDrawerIsOpen}
			/>
		</>
	);
}
