import useModelStore from '@/store/database/modelStore.ts';
import { ListFields, EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';

export default function Fields() {
	const { isOpenEditFieldDialog, setIsOpenEditFieldDialog } = useModelStore();
	return (
		<>
			<ListFields />
			<EditOrCreateFieldDrawer
				open={isOpenEditFieldDialog}
				onOpenChange={setIsOpenEditFieldDialog}
				editMode
			/>
		</>
	);
}
