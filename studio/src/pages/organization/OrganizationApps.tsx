import { Button, ButtonGroup } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { EmptyApps, Leave, List, SquaresFour } from '@/components/icons';
import { ApplicationCard } from '@/features/application';
import AppInviteMember from '@/features/application/AppInviteMember';
import ApplicationTable from '@/features/application/ApplicationTable/ApplicationTable';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useApplicationStore from '@/store/app/applicationStore.ts';
import { Application, APIError } from '@/types';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { InfoModal } from '@/components/InfoModal';
export default function OrganizationApps() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<null | APIError>(null);
	const [isCard, setIsCard] = useState(true);
	const { notify } = useToast();
	const [searchParams, setSearchParams] = useSearchParams();
	const { organization } = useOrganizationStore();
	const {
		applications,
		temp,
		toDeleteApp,
		searchApplications,
		leaveAppTeam,
		deleteApplication,
		isDeleteModalOpen,
		closeDeleteModal,
		isLeaveModalOpen,
		closeLeaveModal,
		getAppsByOrgId,
	} = useApplicationStore();
	const canAppCreate = useAuthorizeOrg('app.create');
	const { t } = useTranslation();

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
		} else setSearchParams({ ...searchParams, q: value });
	}

	function leaveAppHandler() {
		leaveAppTeam({
			appId: toDeleteApp?._id as string,
			orgId: organization?._id as string,
			onSuccess: () => {
				closeDeleteModal();
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	function deleteAppHandler() {
		setLoading(true);
		deleteApplication({
			appId: toDeleteApp?._id as string,
			orgId: organization?._id as string,
			onSuccess: () => {
				closeDeleteModal();
				setLoading(false);
			},
			onError: (err) => {
				closeDeleteModal();
				setLoading(false);
				setError(err);
				notify({
					title: err.error,
					description: err.details,
					type: 'error',
				});
			},
		});
	}

	useEffect(() => {
		const query = searchParams.get('q');
		if (temp.length) searchApplications(query as string);
	}, [searchParams.get('q'), temp]);

	useEffect(() => {
		getAppsByOrgId(organization?._id as string);
	}, [organization?._id]);
	return (
		<div className={cn('scroll p-8', !temp.length && 'flex items-center justify-center')}>
			{temp.length > 0 ? (
				<>
					<div className='flex  items-center justify-between'>
						<h1 className='text-default text-2xl font-semibold text-center'>
							{applications.length} {t('application.apps')}
						</h1>
						<div className='flex items-center justify-center gap-6'>
							<SearchInput
								placeholder='Search apps'
								onSearch={onInput}
								value={searchParams.get('q') as string}
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
						<div
							className={cn(
								'mt-8 flex flex-wrap gap-6 items-center',
								!applications.length && 'h-3/4 justify-center',
							)}
						>
							{applications.length > 0 ? (
								applications.map((application: Application) => (
									<ApplicationCard key={application._id} application={application} />
								))
							) : (
								<EmptyState
									title={t('application.search_empty')}
									icon={<EmptyApps className='w-44 h-44' />}
								/>
							)}
						</div>
					) : (
						<ApplicationTable apps={applications} />
					)}
				</>
			) : (
				<EmptyState title={t('application.empty')} icon={<EmptyApps className='w-44 h-44' />}>
					<CreateApplicationButton disabled={!canAppCreate} />
				</EmptyState>
			)}
			<AppInviteMember />
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('application.delete.title')}
				alertTitle={t('application.delete.alert')}
				alertDescription={t('application.delete.description')}
				description={
					<Trans
						i18nKey='application.delete.confirmCode'
						values={{ confirmCode: toDeleteApp?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteApp?.iid as string}
				onConfirm={deleteAppHandler}
				isOpen={isDeleteModalOpen}
				closeModal={closeDeleteModal}
				closable
			/>
			<InfoModal
				isOpen={isLeaveModalOpen}
				closeModal={closeLeaveModal}
				title={t('application.leave.title')}
				description={t('application.leave.description')}
				icon={
					<div className='bg-lighter p-7 rounded-full text-center'>
						<Leave className='w-12 h-12 text-icon-base' />
					</div>
				}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button
							variant='text'
							size='lg'
							onClick={(e) => {
								e.stopPropagation();
								closeLeaveModal();
							}}
						>
							{t('general.cancel')}
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={(e) => {
								e.stopPropagation();
								leaveAppHandler();
							}}
						>
							{t('general.ok')}
						</Button>
					</div>
				}
			/>
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
