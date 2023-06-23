import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Switch } from 'components/Switch';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DeploymentSettingsProps {
	isOpen: boolean;
	close: () => void;
}

export default function DeploymentSettings({ isOpen, close }: DeploymentSettingsProps) {
	const { t } = useTranslation();
	return (
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
						<div>
							<div>
								<h5>{t('version.suspend_services')}</h5>
								<p>{t('version.suspend_services_desc')}</p>
							</div>
							<div className='flex items-center'>
								<Button>{t('version.reactivate')}</Button>
							</div>
						</div>
						<div>
							<div>
								<h5>{t('version.redeploy')}</h5>
								<p>{t('version.redeploy_desc')}</p>
							</div>
							<div className='flex items-center'>
								<Button>{t('version.redeploy')}</Button>
							</div>
						</div>
						<div>
							<div>
								<h5>{t('version.auto_redeploy')}</h5>
								<p>{t('version.auto_redeploy_desc')}</p>
							</div>
							<div className='flex items-center'>
								<Switch />
							</div>
						</div>
					</div>
					<footer className='deployment-settings-footer'>
						<Button variant='link'>{t('version.view_logs')}</Button>
					</footer>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
