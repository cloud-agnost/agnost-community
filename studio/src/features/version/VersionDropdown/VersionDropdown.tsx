import { Button } from '@/components/Button';
import { useToast, useVersionDropdownItems } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError } from '@/types';
import { CaretUpDown, LockSimple, LockSimpleOpen, Trash } from '@phosphor-icons/react';
import { ConfirmationModal } from 'components/ConfirmationModal';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { resetAfterVersionChange } from '@/utils';

export default function VersionDropdown() {
	const { toast } = useToast();
	const { version } = useVersionStore();
	const { t } = useTranslation();
	const [error, setError] = useState<null | APIError>(null);
	const [loading, setLoading] = useState(false);
	const confirmCode = useVersionStore((state) => state.version?.iid) as string;
	const deleteVersionDrawerIsOpen = useVersionStore((state) => state.deleteVersionDrawerIsOpen);
	const deleteVersion = useVersionStore((state) => state.deleteVersion);
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const navigate = useNavigate();
	const { application, openVersionDrawer } = useApplicationStore();
	const { addSettingsTab } = useTabStore();
	const versionDropdownItems = useVersionDropdownItems();

	async function onConfirm() {
		setLoading(true);
		setError(null);
		deleteVersion({
			orgId,
			appId,
			versionId,
			onSuccess: () => {
				resetAfterVersionChange();
				useVersionStore.setState({ deleteVersionDrawerIsOpen: false });
				navigate(`/organization/${orgId}/apps`);
				if (application) openVersionDrawer(application);
				setLoading(false);
			},
			onError: (error) => {
				toast({
					action: 'error',
					title: error.details,
				});
				setError(error as APIError);
				setLoading(false);
			},
		});
	}

	return (
		<>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('version.delete_version')}
				alertTitle={t('version.delete_alert_title')}
				alertDescription={t('version.delete_alert_desc')}
				description={
					<Trans
						i18nKey='version.delete_confirm_description'
						values={{ confirmCode }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={confirmCode}
				onConfirm={onConfirm}
				isOpen={deleteVersionDrawerIsOpen}
				closeModal={() => useVersionStore.setState({ deleteVersionDrawerIsOpen: false })}
				closable
			/>
			<DropdownMenu>
				<div className='w-[210px] h-10 relative rounded-sm overflow-hidden'>
					<Button
						variant='blank'
						className='flex items-center px-1.5 h-full w-full hover:bg-wrapper-background-hover transition font-normal rounded-sm'
						onClick={() => addSettingsTab(version._id)}
					>
						<div className='w-8 h-8 bg-lighter flex items-center justify-center rounded p-[6px] text-icon-base mr-2'>
							{version?.readOnly ? <LockSimple size={20} /> : <LockSimpleOpen size={20} />}
						</div>
						<div className='text-left flex-1 font-sfCompact h-full flex flex-col justify-center'>
							<div className=' text-sm leading-none text-default whitespace-nowrap truncate max-w-[12ch]'>
								{version?.name}
							</div>
							<div className='text-xs text-subtle'>
								{version?.readOnly ? 'Read Only' : 'Read/Write'}
							</div>
						</div>
					</Button>
					<DropdownMenuTrigger asChild>
						<Button
							variant='blank'
							className='absolute z-50 top-0 -right-1  p-1.5 text-icon-base hover:text-icon-secondary'
							rounded
						>
							<div className='rounded-full hover:bg-wrapper-background-hover w-8 h-8 flex items-center justify-center'>
								<CaretUpDown size={20} />
							</div>
						</Button>
					</DropdownMenuTrigger>
				</div>

				<DropdownMenuContent align='end' className='min-w-[210px]'>
					<DropdownMenuItemContainer>
						{versionDropdownItems.map((option) => (
							<DropdownMenuItem
								onClick={option.action}
								key={option.title}
								disabled={option.disabled}
							>
								<option.icon className='w-5 h-5 mr-2' />
								{option.title}
							</DropdownMenuItem>
						))}
						{!version?.master && (
							<Fragment>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => useVersionStore.setState({ deleteVersionDrawerIsOpen: true })}
								>
									<Trash className='w-5 h-5 mr-2' />
									{t('version.delete')}
								</DropdownMenuItem>
							</Fragment>
						)}
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
