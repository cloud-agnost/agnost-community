import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { InfoModal } from '@/components/InfoModal';
import { Pencil, Warning } from '@/components/icons';
import { useEditor } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn } from '@/utils';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KeepAlive } from 'react-keep-alive';
import { useLocation, useParams } from 'react-router-dom';
interface VersionEditorLayoutProps {
	children: React.ReactNode;
	className?: string;
	loading: boolean;
	logic?: string;
	breadCrumbItems?: BreadCrumbItem[];
	name: string;
	onSaveLogic: (logic?: string) => void;
	onTestModalOpen?: () => void;
	onEditModalOpen: () => void;
	setLogic: (logic: string | undefined) => void;
}

const initBeforeUnLoad = (showExitPrompt: boolean) => {
	window.onbeforeunload = (event) => {
		// Show prompt based on state
		if (showExitPrompt) {
			const e = event || window.event;
			e.preventDefault();
			if (e) {
				e.returnValue = '';
			}
			return '';
		}
	};
};

export default function VersionEditorLayout({
	children,
	logic,
	loading,
	breadCrumbItems,
	onSaveLogic,
	onTestModalOpen,
	onEditModalOpen,
	setLogic,
	className,
	name,
}: VersionEditorLayoutProps) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const { versionId } = useParams<{ versionId: string }>();
	const { removeTab, toDeleteTab, isDeleteTabModalOpen, closeDeleteTabModal, getCurrentTab } =
		useTabStore();
	const tab = getCurrentTab(versionId as string);
	const { saveEditorContent } = useEditor({});
	async function handleSaveLogic() {
		saveEditorContent('javascript', (val: string) => {
			setLogic(val);
			onSaveLogic(val);
		});
	}

	window.onload = function () {
		initBeforeUnLoad(tab.isDirty as boolean);
	};

	useEffect(() => {
		initBeforeUnLoad(tab.isDirty as boolean);
	}, [tab.isDirty]);
	return (
		<div className={cn('space-y-6 h-full', className)}>
			<div className='flex items-center gap-4'>
				{breadCrumbItems && (
					<BreadCrumb
						goBackLink={pathname.split('/').slice(0, -1).join('/')}
						items={breadCrumbItems}
					/>
				)}
			</div>
			<div className='flex items-center justify-between'>
				{children}
				<div className='flex items-center gap-4'>
					<Button variant='secondary' onClick={onEditModalOpen}>
						<Pencil className='text-icon-default w-5 h-5 mr-2' />
						{t('general.edit')}
					</Button>

					{onTestModalOpen && (
						<Button variant='secondary' onClick={onTestModalOpen}>
							<TestTube size={20} className='text-icon-default mr-2' />
							{t('endpoint.test.test')}
						</Button>
					)}
					<Button variant='primary' onClick={() => handleSaveLogic()} loading={loading}>
						<FloppyDisk size={20} className='text-icon-default mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>
			{/*  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore */}
			<KeepAlive name={name} key={name}>
				<CodeEditor
					className='h-full'
					containerClassName='h-[88%]'
					value={logic}
					onChange={setLogic}
					onSave={onSaveLogic}
				/>
			</KeepAlive>
			<InfoModal
				isOpen={isDeleteTabModalOpen}
				closeModal={closeDeleteTabModal}
				icon={<Warning className='text-icon-danger w-20 h-20' />}
				action={
					<div className='flex items-center justify-center gap-4'>
						<Button variant='text' size='lg' onClick={closeDeleteTabModal}>
							{t('general.cancel')}
						</Button>
						<Button
							variant='secondary'
							size='lg'
							onClick={() => {
								removeTab(versionId as string, toDeleteTab.id);
								handleSaveLogic();
							}}
						>
							{t('general.save_and_close')}
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={() => removeTab(versionId as string, toDeleteTab.id)}
						>
							{t('general.ok')}
						</Button>
					</div>
				}
				title={t('general.tab_close_title')}
				description={t('general.tab_close_description')}
			/>
		</div>
	);
}
