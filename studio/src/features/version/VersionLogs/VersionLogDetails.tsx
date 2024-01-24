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
				<div className='p-4 flex flex-col flex-1'>
					<CodeEditor
						key={log._id}
						value={JSON.stringify(log, null, 2)}
						defaultLanguage='json'
						containerClassName='flex-1'
						className='h-full'
						readonly
						name={`versionLogDetails-${log._id}`}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
