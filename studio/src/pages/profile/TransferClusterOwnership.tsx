import { TransferOwnership } from '@/components/TransferOwnership';
import { useToast } from '@/hooks';
import useClusterStore from '@/store/cluster/clusterStore';
import { APIError } from '@/types';
import { useState } from 'react';

export default function TransferClusterOwnership() {
	const { transferClusterOwnership } = useClusterStore();
	const [userId, setUserId] = useState<string>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	function transferOwnership() {
		setLoading(true);
		transferClusterOwnership({
			userId: userId as string,
			onSuccess: () => {
				setLoading(false);
				setUserId(undefined);
			},
			onError: (error: APIError) => {
				setLoading(false);
				setError(error);
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		});
	}
	return (
		<TransferOwnership
			transferOwnership={transferOwnership}
			error={error as APIError}
			loading={loading}
			setUserId={setUserId}
			userId={userId as string}
		/>
	);
}
