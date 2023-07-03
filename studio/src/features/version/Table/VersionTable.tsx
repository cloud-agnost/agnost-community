import { DataTable } from '@/components/DataTable';
import useVersionStore from '@/store/version/versionStore';
import { VersionTableColumns } from './VersionTableColumns';

interface VersionTableProps {
	setPage: (page: number) => void;
}

export default function VersionTable({ setPage }: VersionTableProps) {
	const { versions } = useVersionStore();
	return <DataTable columns={VersionTableColumns} data={versions} />;
}
