import useModelStore from '@/store/database/modelStore.ts';
import { ListFields, EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';
import { useParams } from 'react-router-dom';
import { Model } from '@/types';

export default function Fields() {
	const { modelId } = useParams();
	const { isOpenEditFieldDialog, setIsOpenEditFieldDialog } = useModelStore();
	const model = useModelStore((state) =>
		state.models.find((model) => model._id === modelId),
	) as Model;

	return (
		<>
			<ListFields model={model} />
			<EditOrCreateFieldDrawer
				key={isOpenEditFieldDialog.toString()}
				open={isOpenEditFieldDialog}
				onOpenChange={setIsOpenEditFieldDialog}
				editMode
			/>
		</>
	);
}
