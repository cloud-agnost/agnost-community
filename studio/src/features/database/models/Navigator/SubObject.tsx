import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { Model, NavigatorComponentProps } from '@/types';
import { useParams } from 'react-router-dom';

export default function SubObject({ field, parentId, row }: NavigatorComponentProps) {
	const { getSpecificModelByIidOfDatabase, setNestedModels } = useModelStore();
	const iid = field.type === 'object-list' ? field.objectList?.iid : field.object?.iid;
	const data = row?.original;
	const { dbId, orgId, versionId, appId } = useParams<{
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	}>();

	function getModel() {
		return getSpecificModelByIidOfDatabase({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			dbId: dbId as string,
			modelIid: iid as string,
			onSuccess: (model: Model) => {
				setNestedModels(model.name, row?.index as number);
				if (data?.[field.name] || model.fields.length > 0) {
					useNavigatorStore.setState({
						subModelData: field.type === 'object-list' ? data?.[field.name] : [data?.[field.name]],
						selectedSubModelId: parentId,
					});
				} else {
					useNavigatorStore.setState({
						subModelData: [],
						selectedSubModelId: parentId,
					});
				}
			},
		});
	}

	return (
		<Button className='link' variant='blank' onClick={getModel}>
			{field.name}
		</Button>
	);
}
