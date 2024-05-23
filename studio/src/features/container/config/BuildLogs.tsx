import { Button } from '@/components/Button';
import { LogViewer } from '@/components/LogViewer';
import { Github } from '@/components/icons';
import useContainerStore from '@/store/container/containerStore';
import { ContainerPipelineLogStatus, ContainerPipelineLogs } from '@/types/container';
import { cn, getRelativeTime, getStatusClass, secondsToRelativeTime } from '@/utils';
import {
	ArrowLeft,
	CheckCircle,
	CircleNotch,
	GitBranch,
	GitCommit,
	Prohibit,
	WarningCircle,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { startCase } from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
export default function BuildLogs() {
	const { t } = useTranslation();

	const { getContainerPipelineLogs, container, selectPipeline, selectedPipeline } =
		useContainerStore();
	const { orgId, envId, projectId } = useParams() as Record<string, string>;
	const [selectedStep, setSelectedStep] = useState('setup');
	const [logs, setLogs] = useState<string[]>([]);
	const { data: pipelineLogs } = useQuery<ContainerPipelineLogs[]>({
		queryKey: ['containerPipelineLogs'],
		queryFn: () =>
			getContainerPipelineLogs({
				orgId,
				envId,
				projectId,
				containerId: container?._id!,
				pipelineName: selectedPipeline?.name!,
			}),
		refetchInterval: 3000,
	});

	const selectedLog = useMemo(() => {
		const step = pipelineLogs?.find((log) => log.step === selectedStep);
		setLogs(step?.logs ?? []);
		return step;
	}, [pipelineLogs, selectedStep]);

	function getStatusText(status: ContainerPipelineLogStatus) {
		switch (status) {
			case 'success':
				return 'Step completed successfully';
			case 'failed':
				return 'Step failed';
			case 'running':
				return 'Step running';
			case 'pending':
				return 'Step waiting previous step completion';
		}
	}

	return (
		<div className='space-y-4 h-full flex flex-col'>
			<div>
				<Button variant='text' className='gap-4 hover:underline' onClick={() => selectPipeline()}>
					<ArrowLeft />
					{t('container.pipeline.back')}
				</Button>
			</div>
			<div className='text-default text-xs font-sfCompact space-y-2'>
				<div className='flex justify-between font-semibold text-subtle'>
					<p className='flex-1'>{t('container.pipeline.triggered')}</p>
					<p className='flex-1'>{t('container.pipeline.commit')}</p>
					<p className='flex-1'>{t('container.pipeline.status')}</p>
					<p className='flex-1'>{t('container.pipeline.duration')}</p>
				</div>

				<div className='grid grid-cols-4'>
					<div className='space-y-1'>
						<Link
							to={`https://github.com/${selectedPipeline?.GIT_COMMITTER_USERNAME}`}
							target='_blank'
							rel='noopener noreferrer'
							className='space-y-2 text-default hover:underline hover:text-elements-blue'
						>
							<div className='flex items-center'>
								<Github />
								<span className='ml-2'>{selectedPipeline?.GIT_COMMITTER_USERNAME}</span>
							</div>
						</Link>
						<p className='text-subtle'>
							{getRelativeTime(selectedPipeline?.GIT_COMMIT_TIMESTAMP!)}
						</p>
					</div>
					<div className='space-y-2'>
						<p>{selectedPipeline?.GIT_COMMIT_MESSAGE}</p>
						<div className='flex items-center gap-4'>
							<Link
								to={selectedPipeline?.GIT_COMMIT_URL!}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-1 text-default hover:underline hover:text-elements-blue'
							>
								<GitCommit size={16} />
								<span>{selectedPipeline?.GIT_COMMIT_ID}</span>
							</Link>
							<Link
								to={`${selectedPipeline?.GIT_REPO_URL}/tree/${selectedPipeline?.GIT_BRANCH}`}
								target='_blank'
								rel='noopener noreferrer'
								className='bg-elements-blue truncate text-xs px-1 rounded flex items-center gap-0.5 hover:underline'
							>
								<GitBranch size={10} />
								<span>{selectedPipeline?.GIT_BRANCH}</span>
							</Link>
						</div>
					</div>
					<div className={cn('flex items-center gap-2', getStatusClass(selectedPipeline?.status!))}>
						{selectedPipeline?.status === 'Succeeded' && (
							<CheckCircle size={16} className='text-elements-green' />
						)}
						{selectedPipeline?.status === 'Failed' && (
							<WarningCircle size={16} className='text-elements-red' />
						)}
						{selectedPipeline?.status === 'Running' && (
							<CircleNotch size={16} className='animate-spin' />
						)}

						<p>{selectedPipeline?.status}</p>
					</div>
					<p className='flex-1 self-center'>
						{secondsToRelativeTime(selectedPipeline?.durationSeconds!)}
					</p>
				</div>
			</div>
			<div className='flex items-center gap-4'>
				{pipelineLogs?.map((log) => (
					<Button
						key={log.step}
						variant='text'
						className={cn('gap-2', selectedStep === log.step && ' bg-wrapper-background-hover')}
						onClick={() => setSelectedStep(log.step)}
					>
						{log?.status === 'success' && <CheckCircle size={16} className='text-elements-green' />}
						{log?.status === 'failed' && <WarningCircle size={16} className='text-elements-red' />}
						{log?.status === 'running' && <CircleNotch size={16} className='animate-spin' />}
						{log?.status === 'pending' && <Prohibit size={16} />}
						{startCase(log.step)}
					</Button>
				))}
			</div>
			<LogViewer logs={logs} className='flex-1' />
			<p
				className={cn(
					'font-sfCompact text-xs',
					selectedLog?.status === 'success' && 'text-elements-green',
					selectedLog?.status === 'failed' && 'text-elements-red',
				)}
			>
				{getStatusText(selectedLog?.status!)}
			</p>
		</div>
	);
}
