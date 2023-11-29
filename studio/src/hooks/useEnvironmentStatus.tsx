import useEnvironmentStore from '@/store/environment/environmentStore';
import { useMemo } from 'react';
import { EnvironmentStatus } from '@/types';
export default function useEnvironmentStatus() {
	const { environment, resources, setEnvStatus } = useEnvironmentStore();
	useMemo(() => {
		const hasStatus = (statuses: string[]) =>
			Object.values(environment).some((status) => statuses.includes(status));

		const hasErrorResources = () =>
			resources.some((resource) => resource.status === EnvironmentStatus.Error);

		const hasIdleResources = () =>
			resources.some((resource) => resource.status === EnvironmentStatus.Idle);

		const checksAndValues = [
			{ check: environment.suspended, value: EnvironmentStatus.Suspended },
			{
				check: hasStatus([EnvironmentStatus.Deploying, EnvironmentStatus.Redeploying]),
				value: EnvironmentStatus.Deploying,
			},
			{ check: hasStatus(['error']) || hasErrorResources(), value: EnvironmentStatus.Error },
			{ check: hasIdleResources(), value: EnvironmentStatus.Idle },
		];

		const result = checksAndValues.find(({ check }) => check);

		setEnvStatus(result?.value ?? EnvironmentStatus.OK);
	}, [environment, resources]);
}
