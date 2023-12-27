import { Button } from '@/components/Button';
import { useToast, useVersionDropdownItems } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError } from '@/types';
import { CaretUpDown, LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
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
import './versionDropdown.scss';
import { resetAfterVersionChange } from '@/utils';

export default function VersionDropdown() {
	const [open, setOpen] = useState(false);
	const { notify } = useToast();
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
				notify({
					type: 'error',
					title: error.error,
					description: error.details,
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
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<div className='version-dropdown'>
					<Button
						variant='blank'
						className='version-dropdown-label'
						onClick={() => addSettingsTab(version._id)}
					>
						<div className='version-label-icon'>
							{version?.readOnly ? <LockSimple size={20} /> : <LockSimpleOpen size={20} />}
						</div>
						<div className='version-dropdown-label-desc'>
							<div className='version-dropdown-label-desc-name'>{version?.name}</div>
							<div className='text-xs text-subtle'>
								{version?.readOnly ? 'Read Only' : 'Read/Write'}
							</div>
						</div>
					</Button>
					<DropdownMenuTrigger asChild>
						<div className='version-dropdown-button'>
							<Button variant='blank' role='combobox' aria-expanded={open} rounded>
								<span className='version-dropdown-icon'>
									<CaretUpDown size={20} />
								</span>
							</Button>
						</div>
					</DropdownMenuTrigger>
				</div>

				<DropdownMenuContent align='end' className='version-dropdown-content'>
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
