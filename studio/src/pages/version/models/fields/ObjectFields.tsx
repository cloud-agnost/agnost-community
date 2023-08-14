import useModelStore from '@/store/database/modelStore.ts';
import { EditOrCreateFieldDrawer, ListFields } from '@/features/database/models/fields/ListFields';
import { LoaderFunctionArgs } from 'react-router-dom';
import { Model } from '@/types';
import { useMemo } from 'react';

ObjectFields.loader = async ({ params }: LoaderFunctionArgs) => {
	const { modelIid, versionId, dbId, appId, orgId } = params as Record<string, string>;
	const { getSpecificModelByIidOfDatabase } = useModelStore.getState();

	await getSpecificModelByIidOfDatabase({
		appId,
		versionId,
		orgId,
		dbId,
		modelIid,
	});

	return {};
};

export default function ObjectFields() {
	const { isOpenEditFieldDialog, setIsOpenEditFieldDialog, models, subModel } = useModelStore();

	const parentModel = useMemo(() => {
		return models.find((_model) => _model.iid === subModel?.parentiid);
	}, [models]) as Model;

	return (
		<>
			<ListFields parentModel={parentModel} model={subModel as Model} />
			<EditOrCreateFieldDrawer
				key={isOpenEditFieldDialog.toString()}
				open={isOpenEditFieldDialog}
				onOpenChange={setIsOpenEditFieldDialog}
				editMode
			/>
		</>
	);
}
