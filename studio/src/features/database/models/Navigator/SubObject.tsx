import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { Model, NavigatorComponentProps } from '@/types';
import { useParams } from 'react-router-dom';

export default function SubObject({ field, parentId, value, index }: NavigatorComponentProps) {
	const { getSpecificModelByIidOfDatabase, setNestedModels } = useModelStore();
	const iid = field.type === 'object-list' ? field.objectList?.iid : field.object?.iid;
	const { dbId, orgId, versionId, appId } = useParams() as Record<string, string>;

	function getModel() {
		return getSpecificModelByIidOfDatabase({
			orgId: orgId,
			appId: appId,
			versionId: versionId,
			dbId: dbId,
			modelIid: iid as string,
			onSuccess: (model: Model) => {
				setNestedModels(model.name, index);
				if (value || model.fields.length > 0) {
					useNavigatorStore.setState({
						subModelData: field.type === 'object-list' ? value : [value],
						selectedSubModelId: parentId,
					});
				} else {
					useNavigatorStore.setState({
						subModelData: {},
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
