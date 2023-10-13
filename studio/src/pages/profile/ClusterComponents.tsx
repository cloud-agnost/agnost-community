import { DataTable } from '@/components/DataTable';
import useClusterStore from '@/store/cluster/clusterStore';
import { ClusterComponent } from '@/types';
import { useEffect } from 'react';
import ClusterComponentColumns from './ClusterComponentColumns';
import EditClusterComponent from './EditClusterComponent';
export default function ClusterComponents() {
	const { clusterComponents, getClusterComponents } = useClusterStore();

	useEffect(() => {
		getClusterComponents();
	}, []);
	return (
		<>
			<DataTable<ClusterComponent> data={clusterComponents} columns={ClusterComponentColumns} />
			<EditClusterComponent />
		</>
	);
}
