import { DataTable } from '@/components/DataTable';
import { ResourceTableColumn } from './ResourceTableColumn';
import { Resource } from '@/types';
import { useTable } from '@/hooks';

interface Props {
	resources: Resource[];
}

export default function ResourceTable({ resources }: Props) {
	const table = useTable({
		data: resources,
		columns: ResourceTableColumn,
	});
	return <DataTable table={table} />;
}
