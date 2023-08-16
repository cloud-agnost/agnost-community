import { DataTable } from '@/components/DataTable';
import { ResourceTableColumn } from '@/features/resources/ResourceTable/ResourceTableColumn';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';

export default function EnvironmentResourcesTable() {
	const resources = useEnvironmentStore((state) => state.resources);
	return <DataTable data={resources} columns={ResourceTableColumn} />;
}
