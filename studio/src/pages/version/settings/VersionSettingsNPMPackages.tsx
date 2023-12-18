import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { NPMActions } from '@/features/version/SettingsNPMPackages';
import NPMPackagesColumns from '@/features/version/SettingsNPMPackages/NPMPackagesColumns';
import { useTable } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { NPMPackage } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsNPMPackages() {
	const { t } = useTranslation();
	const npmPackages = useVersionStore((state) => state.version?.npmPackages ?? []);

	const table = useTable({
		data: npmPackages,
		columns: NPMPackagesColumns,
	});

	return (
		<SettingsContainer
			action={<NPMActions table={table} />}
			pageTitle={t('version.settings.npm_packages')}
			className='table-view'
		>
			{npmPackages.length > 0 ? (
				<DataTable<NPMPackage> table={table} className='navigator' />
			) : (
				<EmptyState type='package' title={t('version.npm.no_package_found')} />
			)}
		</SettingsContainer>
	);
}
