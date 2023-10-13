import useDatabaseStore from '@/store/database/databaseStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { ListDatabase } from '@/features/database/ListDatabase';

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
	return (
		<div className='space-y-6 h-full flex flex-col overflow-auto'>
			<ListDatabase />
		</div>
	);
}
