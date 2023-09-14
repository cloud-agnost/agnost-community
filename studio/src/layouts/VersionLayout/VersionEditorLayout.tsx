import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Pencil } from '@/components/icons';
import { cn, saveEditorContent } from '@/utils';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import the Monaco API
import { useState } from 'react';
import KeepAlive from 'react-fiber-keep-alive';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface VersionEditorLayoutProps {
	children: React.ReactNode;
	className?: string;
	loading: boolean;
	logic?: string;
	breadCrumbItems?: BreadCrumbItem[];
	name: string;
	isSaved: boolean;
	onSaveLogic: (logic?: string) => void;
	onTestModalOpen?: () => void;
	onEditModalOpen: () => void;
	setLogic: (logic: string | undefined) => void;
}

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
	isSaved,
}: VersionEditorLayoutProps) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
	async function handleSaveLogic() {
		saveEditorContent(editor as monaco.editor.IStandaloneCodeEditor, 'javascript', (val) => {
			setLogic(val);
			onSaveLogic(val);
		});
	}

	return (
		<div className={cn('p-4 space-y-6 h-full', className)}>
			<div className='flex items-center gap-4'>
				{breadCrumbItems && (
					<BreadCrumb
						goBackLink={pathname.split('/').slice(0, -1).join('/')}
						items={breadCrumbItems}
					/>
				)}

				{!isSaved && <div className='text-default rounded-full bg-base-reverse w-2.5 h-2.5' />}
			</div>
			<div className='flex items-center justify-between'>
				{children}
				<div className='flex items-center gap-4'>
					<Button variant='secondary' onClick={onEditModalOpen}>
						<Pencil className='text-icon-base w-5 h-5 mr-2' />
						{t('general.edit')}
					</Button>

					<Button variant='secondary' onClick={onTestModalOpen}>
						<TestTube size={20} className='text-icon-base mr-2' />
						{t('endpoint.test.test')}
					</Button>
					<Button variant='primary' onClick={() => handleSaveLogic()} loading={loading}>
						<FloppyDisk size={20} className='text-icon-secondary mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>
			<KeepAlive name={name}>
				<CodeEditor
					className='h-full'
					containerClassName='h-[88%]'
					value={logic}
					onChange={setLogic}
					onSave={(logic) => onSaveLogic(logic)}
					onMount={(editor) => {
						setEditor(editor);
					}}
				/>
			</KeepAlive>
		</div>
	);
}
