import { DataTable } from '@/components/DataTable';
import { ResourceTableColumn } from './ResourceTableColumn';
import { Resource } from '@/types';

interface Props {
	resources: Resource[];
}

export default function ResourceTable({ resources }: Props) {
	return <DataTable columns={ResourceTableColumn} data={resources} />;
}
