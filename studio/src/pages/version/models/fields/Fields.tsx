import useModelStore from '@/store/database/modelStore.ts';
import { ListFields, EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';
import { useParams } from 'react-router-dom';
import { Model } from '@/types';
import { useEffect, useMemo, useState } from 'react';

export default function Fields() {
	const { modelId, versionId, dbId, appId, orgId } = useParams() as Record<string, string>;
	const [parentModelIid, setParentModelIid] = useState<string>();
	const getSpecificModelOfDatabase = useModelStore((state) => state.getSpecificModelOfDatabase);
	const { isOpenEditFieldDialog, setIsOpenEditFieldDialog } = useModelStore();

	const models = useModelStore((state) => state.models);

	const model = useMemo(
		() => models.find((model) => model._id === modelId) as Model,
		[models, modelId],
	);

	const parentModel = useMemo(
		() => models.find((model) => model.iid === parentModelIid),
		[models, parentModelIid],
	);

	useEffect(() => {
		findModel();
	}, [modelId]);

	async function findModel() {
		const model = await getSpecificModelOfDatabase({
			appId,
			versionId,
			orgId,
			dbId,
			modelId,
		});
		setParentModelIid(model.parentiid);
	}

	return (
		<>
			{model && <ListFields key={model._id} parentModel={parentModel} model={model} />}
			<EditOrCreateFieldDrawer
				key={isOpenEditFieldDialog.toString()}
				open={isOpenEditFieldDialog}
				onOpenChange={setIsOpenEditFieldDialog}
				editMode
			/>
		</>
	);
}
