import useEnvironmentStore from '@/store/environment/environmentStore';
import { EnvironmentStatus } from '@/types';
import { useMemo } from 'react';
export default function useEnvironmentStatus() {
	const { environment, resources } = useEnvironmentStore();
	return useMemo(() => {
		if (environment && resources) {
			const hasStatus = (statuses: string[]) =>
				Object.values(environment).some((status) => statuses.includes(status));

			const hasErrorResources = () =>
				resources.some((resource) => resource.status === EnvironmentStatus.Error);

			const hasIdleResources = () =>
				resources.some((resource) => resource.status === EnvironmentStatus.Idle);

			const checksAndValues = [
				{ check: environment.suspended, value: EnvironmentStatus.Suspended },
				{ check: hasStatus(['Error']) || hasErrorResources(), value: EnvironmentStatus.Error },
				{
					check: hasStatus([EnvironmentStatus.Deploying, EnvironmentStatus.Redeploying]),
					value: EnvironmentStatus.Deploying,
				},
				{
					check: hasStatus([EnvironmentStatus.Updating]),
					value: EnvironmentStatus.Updating,
				},
				{ check: hasIdleResources(), value: EnvironmentStatus.Idle },
			];

			const result = checksAndValues.find(({ check }) => check);

			return result?.value ?? EnvironmentStatus.OK;
		}
	}, [environment, resources]);
}
