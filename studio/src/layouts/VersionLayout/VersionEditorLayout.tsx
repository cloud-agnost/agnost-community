import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Pencil } from '@/components/icons';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { useLocation } from 'react-router-dom';
interface VersionEditorLayoutProps {
	children: React.ReactNode;

	loading: boolean;
	logic: string | undefined;
	breadCrumbItems?: BreadCrumbItem[];
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
}: VersionEditorLayoutProps) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	return (
		<div className='p-4 space-y-6 h-full'>
			{breadCrumbItems && (
				<BreadCrumb
					goBackLink={pathname.split('/').slice(0, -1).join('/')}
					items={breadCrumbItems}
				/>
			)}
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
					<Button variant='primary' onClick={() => onSaveLogic()} loading={loading}>
						<FloppyDisk size={20} className='text-icon-secondary mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor
				className='h-full'
				containerClassName='h-[88%]'
				value={logic}
				onChange={setLogic}
				onSave={(value) => onSaveLogic(value)}
			/>
		</div>
	);
}
