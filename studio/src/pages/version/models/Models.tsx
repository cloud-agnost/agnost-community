import { EditOrCreateModelDrawer, ListModels } from '@/features/database/models/ListModels';
import { LoaderFunctionArgs } from 'react-router-dom';
import useModelStore from '@/store/database/modelStore.ts';

export default function Models() {
	const { isOpenEditModelDialog, setIsOpenEditModelDialog } = useModelStore();
	console.log('girdi');
	return (
		<>
			<ListModels />
			<EditOrCreateModelDrawer
				open={isOpenEditModelDialog}
				onOpenChange={setIsOpenEditModelDialog}
				editMode
			/>
		</>
	);
}

Models.loader = async function ({ params }: LoaderFunctionArgs) {
	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};
	const { getModelsOfDatabase } = useModelStore.getState();
	await getModelsOfDatabase(apiParams);
	return null;
};
