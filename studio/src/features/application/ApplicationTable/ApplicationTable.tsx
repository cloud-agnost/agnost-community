import { DataTable } from '@/components/DataTable/DataTable';
import useApplicationStore from '@/store/app/applicationStore';
import { Application } from '@/types';
import { ApplicationColumns } from './ApplicationColumns';

interface ApplicationTableType {
	apps: Application[];
}

export default function ApplicationTable({ apps }: ApplicationTableType) {
	return (
		<div className='my-8'>
			<DataTable
				columns={ApplicationColumns}
				data={apps}
				onRowClick={(app) => {
					useApplicationStore.getState().openVersionDrawer(app);
				}}
			/>
		</div>
	);
}
