import { Field, Model } from '@/types';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useModelStore from '@/store/database/modelStore.ts';

interface SubFieldsProps {
	field: Field;
	name: string;
}
export default function SubFields({ field, name }: SubFieldsProps) {
	const iid = (field?.object || field?.objectList)?.iid;
	const [model, setModel] = useState<Model>();
	const getModel = useModelStore((state) => state.getSpecificModelByIidOfDatabase);
	const { orgId, appId, versionId, dbId } = useParams() as Record<string, string>;
	const { pathname } = useLocation();

	useEffect(() => {
		if (iid) getModelByIid();
	}, [field]);

	async function getModelByIid() {
		const model = await getModel({
			orgId,
			appId,
			modelIid: iid as string,
			versionId,
			dbId,
		});
		setModel(model);
	}

	const path = `/organization/${model?.orgId}/apps/${model?.appId}/version/${model?.versionId}/database/${model?.dbId}/models/${model?._id}/fields`;
	const Component = model ? Link : 'span';
	return (
		<Component to={path} className='flex items-center gap-2 justify-between hover:underline'>
			{name}
		</Component>
	);
}
