import useClusterStore from '@/store/cluster/clusterStore';
import { useEffect } from 'react';

let interval: number | null = null;
export default function useFetchReleaseHistory(mins: number = 15) {
	const { getClusterAndReleaseInfo } = useClusterStore();

	useEffect(() => {
		interval = window.setInterval(() => getClusterAndReleaseInfo(), mins * 60 * 1000);
		return () => {
			if (interval) window.clearInterval(interval);
		};
	}, []);
}
