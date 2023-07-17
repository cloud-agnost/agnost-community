import { SearchInput } from 'components/SearchInput';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { ListDatabase } from '@/features/database/ListDatabase';
import { CreateDatabaseButton } from '@/features/database/CreateDatabaseButton';

VersionDatabase.loader = function () {
	const { getDatabasesOfApp } = useDatabaseStore.getState();
	const { version } = useVersionStore.getState();
	if (!version) return null;

	getDatabasesOfApp({
		orgId: version.orgId,
		versionId: version._id,
		appId: version.appId,
	});
	return {};
};

export default function VersionDatabase() {
	const search = useDatabaseStore((state) => state.searchDatabases);
	return (
		<div className='py-6 space-y-6 h-full'>
			<div className='flex justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>Databases</h1>
				<div className='flex items-center gap-4'>
					<SearchInput
						onClear={() => search('')}
						onChange={(event) => search(event.target.value)}
						className='w-[450px]'
					/>
					<CreateDatabaseButton />
				</div>
			</div>
			<ListDatabase />
		</div>
	);
}
