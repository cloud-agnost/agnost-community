import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { useTable, useToast } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PushVersionTableColumns } from './PushVersionTableColumns';
import { useParams } from 'react-router-dom';
export default function PushVersion() {
	const { t } = useTranslation();
	const { appId, orgId } = useParams();
	const { isPushVersionDrawerOpen, togglePushVersionDrawer, versions, version, pushVersion } =
		useVersionStore();
	const { toast } = useToast();
	const [step, setStep] = useState(0);
	const versionsExcludedCurrent = useMemo(
		() => versions.filter((v) => v._id !== version._id),
		[versions, version],
	);

	const table = useTable({
		data: versionsExcludedCurrent,
		columns: PushVersionTableColumns,
		enableMultiRowSelection: false,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: () =>
			pushVersion({
				orgId: orgId as string,
				appId: appId as string,
				targetVersionId: table.getSelectedRowModel().rows[0].original._id,
				versionId: version._id,
			}),
		mutationKey: ['pushVersion', version._id],
		onSuccess: () => {
			toast({
				title: t('version.pushed_successfully') as string,
				action: 'success',
			});
			onClosed();
		},
		onError: ({ details }: APIError) => {
			toast({
				title: details,
				action: 'error',
			});
		},
	});

	function onClosed() {
		setStep(0);
		togglePushVersionDrawer();
		table.resetRowSelection();
	}

	return (
		<Drawer open={isPushVersionDrawerOpen} onOpenChange={onClosed}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.push_to_version')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					{step === 0 && (
						<div className='space-y-6'>
							<DataTable table={table} />
							<div className='flex justify-end'>
								<Button
									onClick={() => setStep(1)}
									disabled={table.getSelectedRowModel().rows.length === 0}
									className='!ml-4'
								>
									{t('general.next')}
								</Button>
							</div>
						</div>
					)}
					{step === 1 && (
						<div className='space-y-6'>
							<Alert variant='warning'>
								<AlertTitle>{t('general.warning')}</AlertTitle>
								<AlertDescription>
									You are about to push from source version "dev" into target version "master".
									<br />
									<br />
									Please note that the following design entities will not be pushed to the target
									version and you need to manually update these items.
									<br />
									<br />
									<ul className=' list-disc'>
										<li>Environment variables (a.k.a. params) of the version</li>
										<li>API keys of the version</li>
										<li>Authentication settings of the version</li>
										<li>Environment settings of the version</li>
									</ul>
									<br />
									We strongly suggest to disable auto-deploy before pushing source version to the
									target version and perform a manual redeployment after the push operation.
									<br />
									<br />
									Automatically redeploy the changes to the target version (on-off switch, default
									on)
								</AlertDescription>
							</Alert>
							<div className='flex items-center justify-between'>
								<Button variant='secondary' onClick={() => setStep(0)} className='!ml-4'>
									{t('general.cancel')}
								</Button>
								<div className='flex items-center'>
									<Button variant='outline' onClick={() => setStep(0)} className='!ml-4'>
										{t('general.previous')}
									</Button>
									<Button onClick={() => mutate()} loading={isPending} className='!ml-4'>
										{t('general.confirm')}
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
