import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { Field, Model } from '@/types';
import { CustomCellRendererProps } from 'ag-grid-react';
import { useParams } from 'react-router-dom';

interface SubObjectProps extends CustomCellRendererProps {
	field: Field;
}

export default function SubObject({ field, value, node, data }: SubObjectProps) {
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
				setNestedModels(model.name, node.rowIndex as number);
				if (value || model.fields.length > 0) {
					useNavigatorStore.setState({
						subModelData: field.type === 'object-list' ? value : [value],
						selectedSubModelId: data.id,
					});
				} else {
					useNavigatorStore.setState({
						subModelData: {},
						selectedSubModelId: data.id,
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
