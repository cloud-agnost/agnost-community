import { TransferOwnership } from '@/components/TransferOwnership';
import useClusterStore from '@/store/cluster/clusterStore';

export default function TransferClusterOwnership() {
	const { transferClusterOwnership } = useClusterStore();
	return <TransferOwnership transferFn={transferClusterOwnership} type='cluster' />;
}
