import { AnimatePresence, motion } from 'framer-motion';
import { Button } from 'components/Button';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'components/Switch';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from 'components/Drawer';
import { useState } from 'react';

interface DeploymentSettingsProps {
	isOpen: boolean;
	close: () => void;
}

export default function DeploymentSettings({ isOpen, close }: DeploymentSettingsProps) {
	const { t } = useTranslation();
	const [isLogsOpen, setIsLogsOpen] = useState(false);
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
							<Button onClick={() => setIsLogsOpen(true)} variant='link'>
								{t('version.view_logs')}
							</Button>
						</footer>
					</motion.div>
				)}
			</AnimatePresence>
			<Drawer open={isLogsOpen} onOpenChange={() => setIsLogsOpen(false)}>
				<DrawerContent position='right' size='md'>
					<DrawerHeader>
						<DrawerTitle>{t('version.logs')}</DrawerTitle>
					</DrawerHeader>
					<DrawerFooter>
						<DrawerClose asChild></DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
