import { Input } from '@/components/Input';
import { Separator } from '@/components/Separator';
import { Slider } from '@/components/Slider';
import { MAX_DB_SIZE, MIN_DB_SIZE } from '@/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateResourceItem from '../../CreateResourceItem';
import CreateResourceLayout from '../CreateResourceLayout';

export default function CreateDatabase() {
	const [storageSize, setStorageSize] = useState(25);

	const { t } = useTranslation();
	return (
		<CreateResourceLayout title={t('resources.database.create')} actions={<></>} typeSelection>
			<Separator className='my-8' />

			<CreateResourceItem
				title={
					t('resources.database.storage_size', {
						size: storageSize,
					}) as string
				}
			>
				<div className='flex items-center justify-between'>
					<p className=' font-sfCompact text-sm text-default'>
						{t('general.gb', {
							size: MIN_DB_SIZE,
						})}
					</p>
					<p className=' font-sfCompact text-sm text-default'>
						{t('general.gb', {
							size: MAX_DB_SIZE,
						})}
					</p>
				</div>
				<Slider
					defaultValue={[storageSize]}
					max={MAX_DB_SIZE}
					min={MIN_DB_SIZE}
					step={1}
					onValueChange={(val) => setStorageSize(val[0])}
				/>
			</CreateResourceItem>
			<CreateResourceItem title={t('resources.database.read_replicas') as string} lastItem>
				<Input className='w-1/2 bg-transparent' />
			</CreateResourceItem>
		</CreateResourceLayout>
	);
}
