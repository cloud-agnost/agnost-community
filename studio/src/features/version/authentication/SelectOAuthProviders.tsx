import { Button } from '@/components/Button';
import { InfoModal } from '@/components/InfoModal';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { Pencil, Warning } from '@/components/icons';
import { OAUTH_ICON_MAP } from '@/constants';
import useTypeStore from '@/store/types/typeStore';
import useVersionStore from '@/store/version/versionStore';
import { OAuthProvider, OAuthProviderTypes, VersionOAuthProvider } from '@/types';
import { capitalize } from '@/utils';
import { Plus, Trash } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import AddProvider from './AddProvider';

interface SelectProvider {
	provider: OAuthProvider;
	open: boolean;
	editedProvider?: VersionOAuthProvider;
}

interface DeleteProvider {
	open: boolean;
	toDeleteProvider: VersionOAuthProvider;
}

export default function SelectOAuthProviders() {
	const { t } = useTranslation();
	const { oAuthProviderTypes } = useTypeStore();
	const { version, deleteOAuthConfig } = useVersionStore();
	const [selectedProvider, setSelectedProvider] = useReducer(
		(state: SelectProvider, newState: Partial<SelectProvider>) => ({ ...state, ...newState }),
		{
			editedProvider: {} as VersionOAuthProvider,
			provider: {} as OAuthProvider,
			open: false,
		},
	);
	const [openDeleteModal, setOpenDeleteModal] = useReducer(
		(state: DeleteProvider, newState: Partial<DeleteProvider>) => ({ ...state, ...newState }),
		{
			open: false,
			toDeleteProvider: {} as VersionOAuthProvider,
		},
	);

	function getIcon(provider: OAuthProviderTypes): JSX.Element {
		const Icon = OAUTH_ICON_MAP[provider];
		return <Icon className='w-6 h-6' />;
	}
	function handleDeleteOAuthConfig(provider: VersionOAuthProvider) {
		deleteOAuthConfig({
			versionId: version._id,
			providerId: provider._id,
			orgId: version.orgId,
			appId: version.appId,
			onSuccess: () => {
				setOpenDeleteModal({
					open: false,
					toDeleteProvider: {} as VersionOAuthProvider,
				});
			},
		});
	}

	const providers = useMemo(() => {
		return oAuthProviderTypes.filter((type) => {
			return !version.authentication.providers.find((p) => p.provider === type.provider);
		});
	}, [version.authentication.providers]);
	return (
		<SettingsFormItem
			className='py-0'
			contentClassName='p-4 border border-border rounded-lg space-y-4'
			title={t('version.authentication.auth_providers')}
			description={t('version.authentication.auth_providers_desc')}
		>
			<div className='flex items-center justify-between'>
				<p className='text-subtle font-sfCompact'>{t('version.authentication.providers')}</p>
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={!providers.length}>
						<Button variant='secondary'>
							<Plus className='mr-2' />
							{t('version.authentication.add_auth_provider')}
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align='end' className='version-dropdown-content'>
						<DropdownMenuItemContainer className='space-y-2'>
							{providers.map((p) => (
								<DropdownMenuItem
									key={p.provider}
									className='flex items-center gap-4'
									onClick={() => {
										setSelectedProvider({
											provider: p,
											open: true,
										});
									}}
								>
									{getIcon(p.provider)}
									<span className='font-sfCompact text-default'>{capitalize(p.provider)}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuItemContainer>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className='space-y-4'>
				{version.authentication.providers.length ? (
					version.authentication.providers.map((p) => (
						<div
							className='flex justify-between items-center bg-subtle p-2 rounded-lg group'
							key={p._id}
						>
							<div className='flex gap-2'>
								{getIcon(p.provider)}
								<p className='font-sfCompact text-default'>{capitalize(p.provider)}</p>
							</div>
							<div className='invisible group-hover:visible'>
								<Button
									type='button'
									variant='blank'
									iconOnly
									onClick={() => {
										setSelectedProvider({
											provider: oAuthProviderTypes.find((type) => type.provider === p.provider),
											editedProvider: p,
											open: true,
										});
									}}
								>
									<Pencil className='text-subtle w-6 h-6' />
								</Button>
								<Button
									type='button'
									variant='blank'
									iconOnly
									onClick={() =>
										setOpenDeleteModal({
											open: true,
											toDeleteProvider: p,
										})
									}
								>
									<Trash size={24} className='text-subtle' />
								</Button>
							</div>
						</div>
					))
				) : (
					<p className='text-subtle font-sfCompact text-center'>
						{t('version.authentication.no_providers')}
					</p>
				)}
			</div>
			<AddProvider
				open={selectedProvider.open}
				provider={selectedProvider.provider}
				editedProvider={selectedProvider.editedProvider as VersionOAuthProvider}
				onClose={() => setSelectedProvider({ open: false, provider: {} as OAuthProvider })}
			/>
			<InfoModal
				isOpen={openDeleteModal.open}
				closeModal={() =>
					setOpenDeleteModal({
						open: false,
						toDeleteProvider: {} as VersionOAuthProvider,
					})
				}
				title={t('general.singleDelete')}
				description={t('general.deleteDescription')}
				icon={<Warning className='text-icon-danger w-20 h-20' />}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button
							variant='text'
							size='lg'
							onClick={(e) => {
								e.stopPropagation();
								setOpenDeleteModal({
									open: false,
									toDeleteProvider: {} as VersionOAuthProvider,
								});
							}}
						>
							{t('general.cancel')}
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteOAuthConfig(openDeleteModal.toDeleteProvider);
							}}
						>
							{t('general.ok')}
						</Button>
					</div>
				}
			/>
		</SettingsFormItem>
	);
}
