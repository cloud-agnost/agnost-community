import './SettingsNPMPackages.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { Row, Table } from '@tanstack/react-table';
import { NPMPackage } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import NPMPackagesColumns from '@/features/version/SettingsNPMPackages/NPMPackagesColumns.tsx';
import { EmptyState } from 'components/EmptyState';
import { NpmPackage } from '@/components/icons';

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
				<EmptyState
					icon={<NpmPackage className='w-44 h-44' />}
					title={t('version.npm.no_package_found')}
				/>
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
