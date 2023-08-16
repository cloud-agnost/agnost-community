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
					<div className='space-y-4 h-1/3'>
						<p className='text-default font-sfCompact text-sm'>{t('version.details')}</p>
						<CodeEditor
							value={JSON.stringify(log?.message ?? {})}
							defaultLanguage='json'
							containerClassName='h-[90%]'
							readonly
						/>
					</div>
					<div className='space-y-4 h-1/3'>
						<p className='text-default font-sfCompact text-sm'>{t('version.errors')}</p>
						<CodeEditor
							value={JSON.stringify(log?.errors ?? {})}
							defaultLanguage='json'
							containerClassName='h-[90%]'
							readonly
						/>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
