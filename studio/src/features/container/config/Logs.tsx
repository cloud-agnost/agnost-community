import { Badge } from '@/components/Badge';
import { CodeEditor } from '@/components/CodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { BADGE_COLOR_MAP } from '@/constants';
import useContainerStore from '@/store/container/containerStore';
import { ContainerPod } from '@/types/container';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Logs() {
	const { getContainerLogs, container } = useContainerStore();
	const { orgId, envId, projectId } = useParams() as Record<string, string>;

	const { data } = useQuery({
		queryKey: ['containerLogs'],
		queryFn: () =>
			getContainerLogs({
				orgId,
				envId,
				projectId,
				containerId: container?._id!,
			}),
		refetchInterval: 3000,
	});
	const [selectedPod, setSelectedPod] = useState<ContainerPod | undefined>(data.pods[0]);

	function onSelect(podName: string) {
		if (!data?.pods) return;
		setSelectedPod(data.pods.find((pod) => pod.name === podName));
	}

	useEffect(() => {
		if (data?.pods) {
			setSelectedPod(data.pods[0]);
		}
	}, [data]);

	const selectedLogs = useMemo(() => {
		return data?.logs.find((log) => log.podName === selectedPod?.name);
	}, [selectedPod, data]);

	return (
		<div className='h-full space-y-4'>
			<Select defaultValue={selectedPod?.name} onValueChange={onSelect}>
				<SelectTrigger className='w-full'>
					<SelectValue>
						{selectedPod?.name}
						<Badge
							className='ml-4'
							variant={BADGE_COLOR_MAP[selectedPod?.status.toUpperCase() ?? 'DEFAULT']}
							text={selectedPod?.status!}
						/>
					</SelectValue>
				</SelectTrigger>

				<SelectContent>
					{data?.pods?.map((pod) => (
						<SelectItem key={pod.name} value={pod.name}>
							{pod.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className='h-full flex-1'>
				<CodeEditor
					key={selectedLogs?.podName}
					name='pod-logs'
					language='plaintext'
					value={selectedLogs?.logs?.join('\n') ?? ''}
					containerClassName='h-full'
					className='[&_.overflow-guard]:!h-full [&>:first-child]:!h-full'
					options={{
						readOnly: true,
						wrappingIndent: 'indent',
						lineNumbers: 'off',
					}}
				/>
			</div>
		</div>
	);
}
