import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { InfoModal } from '@/components/InfoModal';
import { Pencil } from '@/components/icons';
import { useUpdateEffect } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn, formatCode } from '@/utils';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

interface VersionEditorLayoutProps {
	children: React.ReactNode;
	className?: string;
	loading: boolean;
	logic: string;
	breadCrumbItems?: BreadCrumbItem[];
	name: string;
	canEdit: boolean;
	onSaveLogic: (logic: string) => void;
	onTestModalOpen?: () => void;
	onEditModalOpen: () => void;
	setLogic: (logic: string) => void;
	deleteLogic: () => void;
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
	canEdit,
	deleteLogic,
}: VersionEditorLayoutProps) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const { versionId } = useParams<{ versionId: string }>();
	const [editedLogic, setEditedLogic] = useState(logic);
	const {
		removeTab,
		toDeleteTab,
		isDeleteTabModalOpen,
		closeDeleteTabModal,
		getCurrentTab,
		updateCurrentTab,
	} = useTabStore();
	const tab = getCurrentTab(versionId as string);
	async function handleSaveLogic() {
		const editor = monaco.editor.getEditors()[0];
		const formattedLogic = await formatCode(editor.getValue());
		setLogic(formattedLogic);
		editor.setValue(formattedLogic);
		onSaveLogic(formattedLogic);
		updateCurrentTab(versionId as string, {
			...tab,
			isDirty: false,
		});
	}

	window.onload = function () {
		initBeforeUnLoad(tab.isDirty as boolean);
	};

	useEffect(() => {
		initBeforeUnLoad(tab.isDirty as boolean);
	}, [tab.isDirty]);

	useUpdateEffect(() => {
		setEditedLogic(logic);
	}, [logic]);

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
					<Button variant='secondary' onClick={onEditModalOpen} disabled={!canEdit}>
						<Pencil className='text-icon-default w-5 h-5 mr-2' />
						{t('general.edit')}
					</Button>

					{onTestModalOpen && (
						<Button variant='secondary' onClick={onTestModalOpen}>
							<TestTube size={20} className='text-icon-default mr-2' />
							{t('endpoint.test.test')}
						</Button>
					)}
					<Button variant='primary' onClick={handleSaveLogic} loading={loading} disabled={!canEdit}>
						<FloppyDisk size={20} className='text-icon-default mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor
				className='h-full'
				containerClassName='h-[88%]'
				value={editedLogic}
				onChange={(val) => setLogic(val as string)}
				onSave={(val) => onSaveLogic(val as string)}
				name={name}
				readonly={!canEdit}
			/>
			<InfoModal
				isOpen={isDeleteTabModalOpen}
				closeModal={closeDeleteTabModal}
				onConfirm={() => {
					removeTab(versionId as string, toDeleteTab.id);
					closeDeleteTabModal();
					deleteLogic?.();
				}}
				action={
					<Button
						variant='secondary'
						size='lg'
						onClick={() => {
							removeTab(versionId as string, toDeleteTab.id);
							handleSaveLogic();
							deleteLogic?.();
						}}
					>
						{t('general.save_and_close')}
					</Button>
				}
				title={t('general.tab_close_title')}
				description={t('general.tab_close_description')}
			/>
		</div>
	);
}
