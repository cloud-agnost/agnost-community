import useClusterStore from '@/store/cluster/clusterStore';
import { ClusterResourceStatus, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';

class Cluster extends RealtimeActions<ClusterResourceStatus> {
	delete(): void {
		throw new Error('Method not implemented.');
	}
	update(param: RealtimeActionParams<ClusterResourceStatus>): void {
		useClusterStore.setState?.((prev) => ({
			...prev,
			clusterComponentsReleaseInfo: prev.clusterComponentsReleaseInfo.map((component) => ({
				...component,
				status: param.data.status,
			})),
		}));
	}
	create(): void {
		throw new Error('Method not implemented.');
	}
	telemetry(): void {
		throw new Error('Method not implemented.');
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	accept(): void {
		throw new Error('Method not implemented.');
	}
}

export default Cluster;
