import NPMPackagesColumns from '@/features/version/SettingsNPMPackages/NPMPackagesColumns.tsx';
import useVersionStore from '@/store/version/versionStore.ts';
import { NPMPackage } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsNPMPackages.scss';

interface SettingsNPMPackagesProps {
	selectedRows: Row<NPMPackage>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<NPMPackage>[] | undefined>>;
	setTable: Dispatch<SetStateAction<Table<NPMPackage> | undefined>>;
}

export default function SettingsNPMPackages({
	setSelectedRows,
	setTable,
}: SettingsNPMPackagesProps) {
	const { t } = useTranslation();
	const npmPackages = useVersionStore((state) => state.version?.npmPackages ?? []);

	if (npmPackages.length === 0) {
		return (
			<div className='h-full flex items-center justify-center'>
				<EmptyState type='package' title={t('version.npm.no_package_found')} />
			</div>
		);
	}

	return (
		<div className='data-table-container'>
			<DataTable<NPMPackage>
				columns={NPMPackagesColumns}
				data={npmPackages}
				setTable={setTable}
				setSelectedRows={setSelectedRows}
				noDataMessage={<p className='text-xl'>{t('version.npm.no_package_found')}</p>}
			/>
		</div>
	);
}
