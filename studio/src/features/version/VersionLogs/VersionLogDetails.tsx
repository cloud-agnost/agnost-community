import { CodeEditor } from '@/components/CodeEditor';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useVersionStore from '@/store/version/versionStore';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
interface VersionLogDetailsProps {
	open: boolean;
	onClose: () => void;
}
export default function VersionLogDetails({ open, onClose }: VersionLogDetailsProps) {
	const { log } = useVersionStore();
	const { t } = useTranslation();
	const resizerRef = useRef<HTMLDivElement>(null);
	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{t('version.log_details')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 h-full overflow-auto space-y-6'>
					<PanelGroup direction='vertical' autoSaveId={log._id}>
						<Panel
							defaultSize={32}
							className='max-h-full no-scrollbar !overflow-y-auto'
							minSize={20}
						>
							<div className='space-y-4 h-[80%]'>
								<p className='text-default font-sfCompact text-sm'>{t('version.details')}</p>
								<CodeEditor
									value={JSON.stringify(log?.message ?? {}, null, 2)}
									defaultLanguage='json'
									containerClassName='h-full'
									className='h-full'
									readonly
									name='versionLogDetails'
								/>
							</div>
						</Panel>
						<PanelResizeHandle className='my-6'>
							<Separator
								className='cursor-row-resize h-1 flex items-center justify-center bg-border'
								ref={resizerRef}
							/>
						</PanelResizeHandle>
						<Panel minSize={30}>
							<div className='space-y-4 h-[80%]'>
								<p className='text-default font-sfCompact text-sm'>{t('version.errors')}</p>
								<CodeEditor
									value={JSON.stringify(log?.errors ?? {}, null, 2)}
									defaultLanguage='json'
									containerClassName='h-[90%]'
									readonly
									name='versionLogErrors'
								/>
							</div>
						</Panel>
					</PanelGroup>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
