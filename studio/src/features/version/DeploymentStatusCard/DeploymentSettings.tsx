import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Switch } from 'components/Switch';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { cn } from '@/utils';
import { DeployButton } from '@/features/version/DeployButton';

interface DeploymentSettingsProps {
	isOpen: boolean;
	close: () => void;
}

export default function DeploymentSettings({ isOpen, close }: DeploymentSettingsProps) {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);
	const { toggleAutoDeploy, activateEnvironment, suspendEnvironment } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function suspendOrActive() {
		if (!versionId || !appId || !orgId || !environment?._id) return;

		if (environment?.suspended) {
			await activateEnvironment({
				envId: environment._id,
				orgId,
				appId,
				versionId,
			});
		} else {
			await suspendEnvironment({
				envId: environment._id,
				orgId,
				appId,
				versionId,
			});
		}
	}

	async function onAutoDeployStatusChanged(autoDeploy: boolean) {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		await toggleAutoDeploy({
			envId: environment._id,
			orgId,
			appId,
			versionId,
			autoDeploy,
		});
	}

	const settings = [
		{
			title: environment?.suspended
				? t('version.reactivate_services')
				: t('version.suspend_services'),
			description: environment?.suspended
				? t('version.reactivate_services_desc')
				: t('version.suspend_services_desc'),
			element: (
				<Button
					className={cn(!environment?.suspended && '!text-elements-red')}
					variant={environment?.suspended ? 'primary' : 'outline'}
					onClick={suspendOrActive}
				>
					{environment?.suspended ? t('version.reactivate') : t('version.suspend')}
				</Button>
			),
		},
		{
			title: t('version.redeploy'),
			description: t('version.redeploy_desc'),
			element: <DeployButton />,
		},
		{
			title: t('version.auto_redeploy'),
			description: t('version.auto_redeploy_desc'),
			element: (
				<Switch checked={!!environment?.autoDeploy} onCheckedChange={onAutoDeployStatusChanged} />
			),
		},
	];

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{
							x: '100%',
						}}
						animate={{
							x: 0,
						}}
						transition={{ type: 'tween' }}
						exit={{
							x: '100%',
						}}
						className='deployment-settings p-4'
					>
						<header className='deployment-settings-header'>
							<Button onClick={close} rounded variant='blank' iconOnly>
								<ArrowLeft size={20} />
							</Button>
							<h4>{t('version.deployment_settings')}</h4>
						</header>
						<div className='deployment-settings-items'>
							{settings.map(({ title, description, element }, index) => (
								<div className='deployment-settings-item' key={index}>
									<div className='deployment-settings-text'>
										<h5>{title}</h5>
										<p>{description}</p>
									</div>
									<div className='flex items-center'>{element}</div>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
