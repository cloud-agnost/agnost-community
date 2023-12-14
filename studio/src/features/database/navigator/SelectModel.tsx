import useModelStore from '@/store/database/modelStore';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/utils';
import { Button } from '@/components/Button';
import { Table } from '@phosphor-icons/react';
import { Model } from '@/types';
export default function SelectModel() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();
	const { model, setModel, models, resetNestedModels } = useModelStore();

	function onModelSelect(model: Model) {
		resetNestedModels();
		searchParams.delete('f');
		searchParams.delete('d');
		searchParams.delete('ref');
		setSearchParams(searchParams);
		setModel(model);
	}
	return (
		<div className=' bg-subtle p-4 rounded-lg w-1/6 space-y-4'>
			<h2 className='text-default text-xl font-sfCompact'>
				{t('database.models.title')}
				<span className='text-subtle font-sfCompact'> ({models.length})</span>
			</h2>

			<div className='space-y-4'>
				{models.map((md) => (
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
