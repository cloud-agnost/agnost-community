import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EmptyState } from '@/components/EmptyState';
import { InfoModal } from '@/components/InfoModal';
import {
	ApplicationCard,
	ApplicationFilter,
	CreateApplicationButton,
} from '@/features/application';
import ApplicationTable from '@/features/application/ApplicationTable/ApplicationTable';
import { useSearch, useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore.ts';
import { APIError, Application } from '@/types';
import { cn, resetAfterVersionChange } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function OrganizationApps() {
	const [isCard, setIsCard] = useState(true);
	const { toast } = useToast();
	const { orgId } = useParams() as Record<string, string>;
	const {
		applications,
		toDeleteApp,
		leaveAppTeam,
		deleteApplication,
		isDeleteModalOpen,
		closeDeleteModal,
		isLeaveModalOpen,
		closeLeaveModal,
		getAppsByOrgId,
	} = useApplicationStore();

	const { t } = useTranslation();
	const filteredApps = useSearch(applications);

	const { mutateAsync: leaveAppMutate, isPending: leaveLoading } = useMutation({
		mutationFn: () =>
			leaveAppTeam({
				appId: toDeleteApp?._id as string,
				orgId,
			}),
		onSuccess: closeLeaveModal,
		onError: ({ details }: APIError) => {
			toast({
				title: details,
				action: 'error',
			});
		},
	});
	const {
		mutateAsync: deleteMutate,
		isPending: deleteLoading,
		error: deleteError,
	} = useMutation({
		mutationFn: () =>
			deleteApplication({
				appId: toDeleteApp?._id as string,
				orgId,
			}),
		onSuccess: () => closeDeleteModal(),
	});

	const { isFetching } = useQuery({
		queryKey: ['apps'],
		queryFn: () => getAppsByOrgId(orgId),
		enabled: applications[0]?.orgId !== orgId,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		resetAfterVersionChange();
	}, []);

	return (
		<div className={cn('scroll p-8', !applications.length && 'flex items-center justify-center')}>
			{!!applications.length && !!filteredApps.length && !isFetching && (
				<>
					<ApplicationFilter isCard={isCard} setIsCard={setIsCard} />
					{isCard ? (
						<div
							className={cn(
								'mt-8 flex flex-wrap gap-6 items-center',
								!applications.length && 'h-3/4 justify-center',
							)}
						>
							{filteredApps.map((application: Application) => (
								<ApplicationCard key={application._id} application={application} />
							))}
						</div>
					) : (
						<ApplicationTable apps={filteredApps} />
					)}
				</>
			)}
			{isFetching && (
				<div className='flex items-center justify-center h-full'>
					<BeatLoader color='#6884FD' size={24} margin={18} />
				</div>
			)}
			{!!applications.length && !filteredApps.length && !isFetching && (
				<EmptyState title={t('application.search_empty')} type='app' />
			)}
			{!applications.length && !isFetching && (
				<EmptyState title={t('application.empty')} type='app'>
					<CreateApplicationButton />
				</EmptyState>
			)}

			<ConfirmationModal
				loading={deleteLoading}
				error={deleteError}
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
				onConfirm={deleteMutate}
				isOpen={isDeleteModalOpen}
				closeModal={closeDeleteModal}
				closable
			/>
			<InfoModal
				isOpen={isLeaveModalOpen}
				closeModal={closeLeaveModal}
				title={t('application.leave.title')}
				description={t('application.leave.description')}
				onConfirm={leaveAppMutate}
				loading={leaveLoading}
			/>
		</div>
	);
}
