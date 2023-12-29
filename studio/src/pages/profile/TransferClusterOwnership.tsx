import { TransferOwnership } from '@/components/TransferOwnership';
import useAuthStore from '@/store/auth/authStore';
import useClusterStore from '@/store/cluster/clusterStore';

export default function TransferClusterOwnership() {
	const { transferClusterOwnership } = useClusterStore();
	const user = useAuthStore((state) => state.user);
	return (
		<TransferOwnership
			transferFn={transferClusterOwnership}
			type='cluster'
			disabled={!user?.isClusterOwner}
		/>
	);
}
