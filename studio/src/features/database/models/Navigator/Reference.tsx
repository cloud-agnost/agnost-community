import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { CustomCellRendererProps } from 'ag-grid-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
interface ReferenceProps extends CustomCellRendererProps {
	referenceModelIid: string;
}

export default function Reference({ value, referenceModelIid }: ReferenceProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { getModelsOfSelectedDb, resetNestedModels, setModel, getSpecificModelByIidOfDatabase } =
		useModelStore();
	const { dbId, versionId, appId, orgId } = useParams() as {
		dbId: string;
		versionId: string;
		appId: string;
		orgId: string;
	};
	const { updateCurrentTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const navigate = useNavigate();
	async function handleDataClick() {
		const referenceModel =
			getModelsOfSelectedDb(dbId)?.find((model) => model.iid === referenceModelIid) ??
			(await getSpecificModelByIidOfDatabase({
				dbId,
				appId,
				orgId,
				versionId,
				modelIid: referenceModelIid,
			}));
		if (referenceModel) {
			resetNestedModels();
			searchParams.delete('f');
			searchParams.delete('d');
			searchParams.delete('ref');
			setSearchParams(searchParams);
			setModel(referenceModel);
			const path = getVersionDashboardPath(
				`database/${dbId}/navigator/${referenceModel._id}?ref=${value}`,
			);
			updateCurrentTab(versionId, {
				path,
			});
			navigate(path);
		}
	}
	return (
		<Button variant='blank' className='link justify-start' onClick={handleDataClick}>
			{value}
		</Button>
	);
}
