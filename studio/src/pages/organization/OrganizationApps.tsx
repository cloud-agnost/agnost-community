import { Button, ButtonGroup } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { EmptyApps, List, SquaresFour } from '@/components/icons';
import { ApplicationCard } from '@/features/application';
import AppInviteMember from '@/features/application/AppInviteMember';
import ApplicationTable from '@/features/application/ApplicationTable/ApplicationTable';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useApplicationStore from '@/store/app/applicationStore.ts';
import { Application } from '@/types';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useSearchParams } from 'react-router-dom';
export default function OrganizationApps() {
	const [isCard, setIsCard] = useState(true);
	const [searchParams, setSearchParams] = useSearchParams();
	const { applications, temp, searchApplications } = useApplicationStore();
	const canAppCreate = useAuthorizeOrg('app.create');
	const { t } = useTranslation();

	useEffect(() => {
		const query = searchParams.get('q');
		if (query) searchApplications(query);
		else searchApplications('');
	}, [searchParams.get('q')]);

	return (
		<div
			className={cn(
				'full-height-without-header p-8',
				temp.length === 0 && 'flex items-center justify-center',
			)}
		>
			{temp.length > 0 ? (
				<div className=''>
					<div className='flex  items-center justify-between'>
						<h1 className='text-default text-2xl font-semibold text-center'>
							{applications.length} {t('application.apps')}
						</h1>
						<div className='flex items-center justify-center gap-6'>
							<SearchInput
								placeholder='Search apps'
								onSearch={(searchTerm) => {
									if (searchTerm) setSearchParams({ q: searchTerm });
									else setSearchParams({});
								}}
							/>
							<ButtonGroup>
								<Button
									variant='outline'
									iconOnly
									className={cn(isCard ? 'bg-lighter' : 'bg-base', 'transition-all')}
									onClick={() => setIsCard(true)}
								>
									<SquaresFour
										className={cn('w-5 h-5', isCard ? 'text-icon-secondary' : 'text-icon-base')}
									/>
								</Button>
								<Button
									variant='outline'
									iconOnly
									className={cn(!isCard ? 'bg-lighter' : 'bg-base', 'transition-all')}
									onClick={() => setIsCard(false)}
								>
									<List
										className={cn('w-5 h-5', !isCard ? 'text-icon-secondary' : 'text-icon-base')}
									/>
								</Button>
							</ButtonGroup>
							<CreateApplicationButton disabled={!canAppCreate} />
						</div>
					</div>
					{isCard ? (
						<div className='mt-8 flex flex-wrap gap-6 items-center'>
							{applications.map((application: Application) => (
								<ApplicationCard key={application._id} application={application} />
							))}
						</div>
					) : (
						<ApplicationTable apps={applications} />
					)}
				</div>
			) : (
				<EmptyState title={t('application.empty')} icon={<EmptyApps className='w-44 h-44' />}>
					<CreateApplicationButton disabled={!canAppCreate} />
				</EmptyState>
			)}
			<AppInviteMember />
		</div>
	);
}

function CreateApplicationButton({ disabled }: { disabled?: boolean }) {
	const { t } = useTranslation();
	const { openAppCreateModal } = useOutletContext<{
		openAppCreateModal: () => void;
	}>();
	return (
		<Button variant='primary' onClick={openAppCreateModal} disabled={disabled}>
			<Plus size={16} className='mr-2 text-icon-secondary' />
			{t('application.create')}
		</Button>
	);
}
