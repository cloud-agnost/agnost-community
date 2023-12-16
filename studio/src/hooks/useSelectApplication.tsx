import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore';
import { Application } from '@/types';
import { useParams } from 'react-router-dom';

export default function useSelectApplication() {
	const { openVersionDrawer, selectApplication } = useApplicationStore();
	const { orgId } = useParams() as Record<string, string>;
	const { getAllVersionsVisibleToUser, selectVersion } = useVersionStore();

	return async function (app: Application) {
		const versions = await getAllVersionsVisibleToUser({
			orgId,
			appId: app?._id as string,
			page: 0,
			size: 2,
		});

		if (versions.length === 1) {
			selectApplication(app);
			selectVersion(versions[0]);
		} else {
			openVersionDrawer(app);
		}
	};
}
