import { DataTable } from '@/components/DataTable';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { EnvironmentResourcesColumn } from './EnvironmentResourcesColumn';
export default function EnvironmentResourcesTable() {
	const resources = useEnvironmentStore((state) => state.resources);
	return <DataTable data={resources} columns={EnvironmentResourcesColumn} />;
}
