import { Button, ButtonGroup } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { List, SquaresFour } from '@/components/icons';
import { ApplicationCard } from '@/features/application';
import useOrganizationStore from '@/store/organization/organizationStore';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
async function loader() {
	const org = useOrganizationStore.getState().organization;
	if (org) await useOrganizationStore.getState().getOrganizationApps(org._id);
	return null;
}

export default function OrganizationApps() {
	const [isCard, setIsCard] = useState(true);
	const { applications } = useOrganizationStore();
	const { t } = useTranslation();

	return (
		<div className='h-[calc(100%-72px)] p-8'>
			{applications.length > 0 ? (
				<div className=''>
					<div className='flex  items-center justify-between'>
						<h1 className='text-default text-2xl font-semibold text-center'>
							{applications.length} {t('application.apps')}
						</h1>
						<div className='flex items-center justify-center gap-6'>
							<SearchInput placeholder='Search apps' />
							<ButtonGroup>
								<Button
									variant='outline'
									iconOnly
									className={cn(isCard && 'bg-lighter transition-all')}
									onClick={() => setIsCard(false)}
								>
									<List className='w-5 h-5 text-icon-secondary ' />
								</Button>
								<Button
									variant='outline'
									iconOnly
									className={cn(!isCard && 'bg-lighter transition-all')}
									onClick={() => setIsCard(true)}
								>
									<SquaresFour className='w-5 h-5 text-icon-secondary' />
								</Button>
							</ButtonGroup>
							<CreateApplicationButton />
						</div>
					</div>
					<div className='mt-8 flex flex-wrap gap-6 items-center'>
						{applications.map((application) => (
							<ApplicationCard key={application._id} application={application} />
						))}
					</div>
				</div>
			) : (
				<EmptyState title={t('application.empty')}>
					<CreateApplicationButton />
				</EmptyState>
			)}
		</div>
	);
}
OrganizationApps.loader = loader;

function CreateApplicationButton() {
	const { t } = useTranslation();
	const { openAppCreateModal } = useOutletContext<{
		openAppCreateModal: () => void;
	}>();
	return (
		<Button variant='primary' onClick={openAppCreateModal}>
			<Plus size={16} className='mr-2 text-icon-secondary' />
			{t('application.create')}
		</Button>
	);
}
