import { DataTable } from '@/components/DataTable';
import useVersionStore from '@/store/version/versionStore';
import { VersionTableColumns } from './VersionTableColumns';

export default function VersionTable() {
	const { versions } = useVersionStore();
	return <DataTable columns={VersionTableColumns} data={versions} />;
}
