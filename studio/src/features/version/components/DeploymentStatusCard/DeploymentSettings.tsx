import { AnimatePresence, motion } from 'framer-motion';
import { Button } from 'components/Button';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'components/Switch';

interface DeploymentSettingsProps {
	isOpen: boolean;
	close: () => void;
}

export default function DeploymentSettings({ isOpen, close }: DeploymentSettingsProps) {
	const { t } = useTranslation();

	function reDeploy() {
		// TODO: will implemented
	}

	function suspendServices() {
		// TODO: will implemented
	}

	function autoRedeployChange(checked: boolean) {
		// TODO: will implemented
		console.log(checked);
	}

	const settings = [
		{
			title: t('version.suspend_services'),
			description: t('version.suspend_services_desc'),
			element: <Button onClick={suspendServices}>{t('version.reactivate')}</Button>,
		},
		{
			title: t('version.redeploy'),
			description: t('version.redeploy_desc'),
			element: <Button onClick={reDeploy}>{t('version.redeploy')}</Button>,
		},
		{
			title: t('version.auto_redeploy'),
			description: t('version.auto_redeploy_desc'),
			element: <Switch onCheckedChange={autoRedeployChange} />,
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
						className='deployment-settings'
					>
						<header className='deployment-settings-header'>
							<Button onClick={close} rounded variant='blank' iconOnly>
								<ArrowLeft size={20} />
							</Button>
							<h4>Deployment Settings</h4>
						</header>
						<div className='deployment-settings-items'>
							{settings.map(({ title, description, element }, index) => (
								<div key={index}>
									<div>
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
