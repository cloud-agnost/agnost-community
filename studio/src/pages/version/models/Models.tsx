import { EditOrCreateModelDrawer, ListModels } from '@/features/database/models/ListModels';
import useModelStore from '@/store/database/modelStore.ts';

export default function Models() {
	const { isOpenEditModelDialog, setIsOpenEditModelDialog } = useModelStore();
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
