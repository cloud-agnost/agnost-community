import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import useVersionStore from '@/store/version/versionStore';
import { Model } from '@/types';
import { cn } from '@/utils';
import { Table } from '@phosphor-icons/react';
import _ from 'lodash';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function SelectModel({
	fetchData,
}: {
	fetchData: (page: number, size?: number) => void;
}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { dbId } = useParams() as { dbId: string };
	const { data } = useNavigatorStore();
	const navigate = useNavigate();
	const { model, setModel, getModelsOfSelectedDb, resetNestedModels } = useModelStore();
	const { getVersionDashboardPath } = useVersionStore();
	function onModelSelect(model: Model) {
		resetNestedModels();
		searchParams.delete('f');
		searchParams.delete('d');
		searchParams.delete('ref');
		setSearchParams(searchParams);
		setModel(model);

		if (_.isNil(data?.[model._id])) fetchData(0);
		navigate(getVersionDashboardPath(`database/${dbId}/navigator/${model._id}`));
	}
	const models = getModelsOfSelectedDb(dbId);
	return (
		<div className=' bg-subtle p-4 rounded-lg w-1/6 space-y-4 overflow-auto'>
			<div className='space-y-4'>
				{models?.map((md) => (
					<div key={md._id}>
						<Button
							className={cn(
								'text-default text-base p-2 font-normal w-full justify-start rounded-lg hover:bg-wrapper-background-hover',
								model._id === md._id && 'bg-wrapper-background-hover',
							)}
							variant='blank'
							onClick={() => onModelSelect(md)}
						>
							<Table className='w-6 h-6 inline-block mr-2' />
							{md.name}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
