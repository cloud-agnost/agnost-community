import { DataTable } from '@/components/DataTable/DataTable';
import { Application } from '@/types';
import { ApplicationColumns } from './ApplicationColumns';

interface ApplicationTableType {
	apps: Application[];
}

export default function ApplicationTable({ apps }: ApplicationTableType) {
	return (
		<div className='my-8'>
			<DataTable columns={ApplicationColumns} data={apps} />
		</div>
	);
}
