import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { InfoModal } from '@/components/InfoModal';
import { useUpdateEffect } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn, formatCode } from '@/utils';
import { FloppyDisk, Pencil, TestTube } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface VersionEditorLayoutProps {
	children?: React.ReactNode;
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
	const { versionId } = useParams<{ versionId: string }>();
	const [editedLogic, setEditedLogic] = useState(logic);

	const { removeTab, toDeleteTab, isDeleteTabModalOpen, closeDeleteTabModal, getCurrentTab } =
		useTabStore();
	const tab = getCurrentTab(versionId as string);

	async function handleSaveLogic() {
		const editor = monaco.editor.getEditors()[0];
		const formattedLogic = await formatCode(editor.getValue());
		setLogic(formattedLogic);
		onSaveLogic(formattedLogic);
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

	useEffect(() => {
		if (window.monaco) {
			const uri = monaco.Uri.parse(`file:///src/${name}.js`);
			window.monaco.editor.getModel(uri)?.setValue(logic);
		}
	}, [window.monaco]);

	return (
		<div className={cn('h-full flex flex-col', className)}>
			<div className='flex items-center justify-between gap-6 py-2 px-4'>
				{breadCrumbItems && <BreadCrumb items={breadCrumbItems} />}
				{children}
				<div className='flex items-center gap-2'>
					<Button variant='secondary' onClick={onEditModalOpen} disabled={!canEdit}>
						<Pencil size={14} className='text-icon-default mr-1' />
						{t('general.edit')}
					</Button>

					{onTestModalOpen && (
						<Button variant='secondary' onClick={onTestModalOpen}>
							<TestTube size={14} className='text-icon-default mr-1' />
							{t('endpoint.test.test')}
						</Button>
					)}
					<Button variant='primary' onClick={handleSaveLogic} loading={loading} disabled={!canEdit}>
						{!loading && <FloppyDisk size={14} className='text-icon-default mr-1' />}
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor
				className='h-full'
				containerClassName='flex-1'
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
					deleteLogic();
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
