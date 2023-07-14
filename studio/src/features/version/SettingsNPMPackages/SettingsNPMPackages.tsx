import './SettingsNPMPackages.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { Row } from '@tanstack/react-table';
import { NPMPackage } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { useTranslation } from 'react-i18next';
import NPMPackagesColumns from '@/features/version/SettingsNPMPackages/NPMPackagesColumns.tsx';

interface SettingsNPMPackagesProps {
	selectedRows: Row<NPMPackage>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<NPMPackage>[] | undefined>>;
}

export default function SettingsNPMPackages({ setSelectedRows }: SettingsNPMPackagesProps) {
	const { t } = useTranslation();
	const npmPackages = useVersionStore((state) => state.version?.npmPackages ?? []);

	return (
		<div className='data-table-container'>
			<DataTable<NPMPackage>
				columns={NPMPackagesColumns}
				data={npmPackages}
				setSelectedRows={setSelectedRows}
				noDataMessage={<p className='text-xl'>{t('version.npm.no_package_found')}</p>}
			/>
		</div>
	);
}
