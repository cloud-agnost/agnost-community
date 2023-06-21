import { DataTable } from '@/components/DataTable/DataTable';
import { ApplicationColumns } from './ApplicationColumns';
import { Application } from '@/types';
import useOrganizationStore from '@/store/organization/organizationStore';

interface ApplicationTableType {
	apps: Application[];
}

export default function ApplicationTable({ apps }: ApplicationTableType) {
	return (
		<div className='my-8'>
			<DataTable
				columns={ApplicationColumns}
				data={apps}
				onRowClick={() => {
					useOrganizationStore.setState({ isVersionOpen: true });
				}}
			/>
		</div>
	);
}
