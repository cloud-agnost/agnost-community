import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Pencil } from '@/components/icons';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface VersionEditorLayoutProps {
	children: React.ReactNode;
	loading: boolean;
	logic: string | undefined;
	onSaveLogic: () => void;
	onTestModalOpen: () => void;
	onEditModalOpen: () => void;
	setLogic: (logic: string | undefined) => void;
}

export default function VersionEditorLayout({
	children,
	logic,
	loading,
	onSaveLogic,
	onTestModalOpen,
	onEditModalOpen,
	setLogic,
}: VersionEditorLayoutProps) {
	const { t } = useTranslation();

	return (
		<div className='p-4 space-y-6 h-full'>
			<div className='flex items-center justify-between'>
				{children}
				<div className='flex items-center gap-4'>
					<Button variant='secondary' iconOnly onClick={onEditModalOpen}>
						<Pencil className='text-icon-base w-5 h-5' />
					</Button>

					<Button variant='secondary' onClick={onTestModalOpen}>
						<TestTube size={20} className='text-icon-base mr-2' />
						{t('endpoint.test.test')}
					</Button>
					<Button variant='primary' onClick={onSaveLogic} loading={loading}>
						<FloppyDisk size={20} className='text-icon-secondary mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor
				containerClassName='h-[95%]'
				value={logic}
				onChange={setLogic}
				onSave={onSaveLogic}
			/>
		</div>
	);
}
