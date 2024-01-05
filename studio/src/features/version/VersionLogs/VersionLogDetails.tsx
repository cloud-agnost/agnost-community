import { CodeEditor } from '@/components/CodeEditor';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useVersionStore from '@/store/version/versionStore';
import { useTranslation } from 'react-i18next';
interface VersionLogDetailsProps {
	open: boolean;
	onClose: () => void;
}
export default function VersionLogDetails({ open, onClose }: VersionLogDetailsProps) {
	const { log } = useVersionStore();
	const { t } = useTranslation();
	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{t('version.log_details')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 h-full overflow-auto space-y-6'>
					<div className='space-y-4 h-[85%]'>
						<p className='text-default font-sfCompact text-sm'>{t('version.details')}</p>
						<CodeEditor
							key={log._id}
							value={JSON.stringify(log, null, 2)}
							defaultLanguage='json'
							containerClassName='h-full'
							className='h-full'
							readonly
							name='versionLogDetails'
						/>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
