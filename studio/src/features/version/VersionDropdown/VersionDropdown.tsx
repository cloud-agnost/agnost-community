import { Button } from '@/components/Button';
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError, VersionProperties } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './versionDropdown.scss';

export default function VersionDropdown() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { application, openVersionDrawer } = useApplicationStore();
	const navigate = useNavigate();
	const { version, updateVersionProperties, createCopyOfVersion } = useVersionStore();

	const { appId, orgId, versionId } = useParams();
	const { pathname } = useLocation();
	const { notify } = useToast();
	const versionHomePath = `/organization/${orgId}/apps/${appId}/version/${versionId}`;
	const VERSION_DROPDOWN_ITEM = [
		{
			title: t('version.open_version'),
			active: false,
			action: () => {
				if (!application) return;
				openVersionDrawer(application);
			},
			disabled: false,
		},
		{
			title: t('version.create_a_copy'),
			active: false,
			action: async () => {
				if (!version) return;
				await createCopyOfVersion(
					{
						orgId: version.orgId,
						appId: version.appId,
						name: `${version?.name} - Copy`,
						parentVersionId: version._id,
						private: version?.private,
						readOnly: version?.readOnly,
					},
					true,
				);
			},
			disabled: false,
		},
		{
			title: t('version.merge'),
			active: false,
			action: () => {
				// TODO: implement
			},
			disabled: true,
			after: <DropdownMenuSeparator />,
		},
		{
			title: t('version.export'),
			active: false,
			action: () => {
				// TODO: implement
			},
			disabled: true,
		},
		{
			title: t('version.import'),
			active: false,
			action: () => {
				// TODO: implement
			},
			disabled: true,
			after: <DropdownMenuSeparator />,
		},
		{
			title: version?.readOnly ? t('version.mark_read_write') : t('version.mark_read_only'),
			active: false,
			action: () => update({ readOnly: !version?.readOnly }),
			disabled: false,
		},
		{
			title: version?.private ? t('version.set_public') : t('version.set_private'),
			active: false,
			action: () => update({ readOnly: !version?.private }),
			disabled: version?.master,
		},
		{
			title: t('version.settings.default'),
			active: pathname === `${versionHomePath}/settings`,
			action: () => {
				navigate(`${versionHomePath}/settings`);
			},
			disabled: false,
			after: <DropdownMenuSeparator />,
		},
		{
			title: t('version.delete'),
			active: false,
			action: () => {
				// TODO: implement
			},
			disabled: false,
		},
	];

	async function update(data: Partial<VersionProperties>) {
		if (!orgId || !versionId || !appId) return;

		try {
			await updateVersionProperties({ orgId, versionId, appId, ...data });
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		}
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<div className='version-dropdown'>
				<Link to={`${versionHomePath}/settings`} className='version-dropdown-label'>
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
					{VERSION_DROPDOWN_ITEM.filter((item) => !item.disabled).map((option, index) => (
						<Fragment key={index}>
							<DropdownMenuItem
								className={cn(option.active && 'active')}
								disabled={option.disabled}
								onClick={option.action}
							>
								{option.title}
							</DropdownMenuItem>
							{option.after}
						</Fragment>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
