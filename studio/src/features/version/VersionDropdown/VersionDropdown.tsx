import { Button } from '@/components/Button';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn } from '@/utils';
import { CaretUpDown, LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './versionDropdown.scss';
import { Trans, useTranslation } from 'react-i18next';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { APIError } from '@/types';
import { VERSION_DROPDOWN_ITEM } from '@/constants';
import useApplicationStore from '@/store/app/applicationStore.ts';

export default function VersionDropdown() {
	const [open, setOpen] = useState(false);
	const { version, getVersionDashboardPath } = useVersionStore();
	const { t } = useTranslation();
	const [error, setError] = useState<null | APIError>(null);
	const [loading, setLoading] = useState(false);
	const confirmCode = useVersionStore((state) => state.version?.iid) as string;
	const deleteVersionDrawerIsOpen = useVersionStore((state) => state.deleteVersionDrawerIsOpen);
	const deleteVersion = useVersionStore((state) => state.deleteVersion);
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const navigate = useNavigate();
	const { application, openVersionDrawer } = useApplicationStore();

	async function onConfirm() {
		setLoading(true);
		setError(null);
		try {
			await deleteVersion({
				orgId,
				appId,
				versionId,
			});
			useVersionStore.setState({ deleteVersionDrawerIsOpen: false });
			navigate(`/organization/${orgId}/apps`);
			if (application) openVersionDrawer(application);
		} catch (e) {
			setError(e as APIError);
		} finally {
			setLoading(false);
		}
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
					<Link to={`${getVersionDashboardPath('/settings')}`} className='version-dropdown-label'>
						<div className='version-label-icon'>
							{version?.readOnly ? <LockSimple size={20} /> : <LockSimpleOpen size={20} />}
						</div>
						<div className='version-dropdown-label-desc'>
							<div className='version-dropdown-label-desc-name'>{version?.name}</div>
							<div className='text-xs text-subtle'>
								{version?.readOnly ? 'Read Only' : 'Read/Write'}
							</div>
						</div>
					</Link>
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
						{VERSION_DROPDOWN_ITEM.filter((item) => !item.disabled()).map((option, index) => {
							const After = option.after();
							return (
								<Fragment key={index}>
									<DropdownMenuItem
										className={cn(option.active() && 'active')}
										disabled={option.disabled()}
										onClick={option.action}
									>
										{option.title()}
									</DropdownMenuItem>
									<After />
								</Fragment>
							);
						})}
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
