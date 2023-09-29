import { OrganizationMenuItem } from '@/features/organization';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import {
	EmailAuthentication,
	MessageTemplates,
	PhoneAuthentication,
	RedirectURLs,
	SelectOAuthProviders,
	SelectUserDataModel,
} from '@/features/version/authentication';
import { handleTabChange } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
enum AUTH_TABS {
	GENERAL = 'general',
	PROVIDERS = 'providers',
	TEMPLATES = 'templates',
}

export default function VersionSettingsAuthentications() {
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const AUTH_MENU_ITEMS = [
		{
			name: t('version.settings.general'),
			href: '?a=general',
		},
		{
			name: t('version.authentication.providers'),
			href: '?a=providers',
		},
		{
			name: t('version.authentication.message_templates'),
			href: '?a=templates',
		},
	];

	return (
		<SettingsContainer pageTitle={t('version.settings.authentications')}>
			<div className='space-y-8'>
				<nav className='flex border-b'>
					{AUTH_MENU_ITEMS.map((item) => (
						<OrganizationMenuItem
							key={item.name}
							item={item}
							active={window.location.search.includes(item.href)}
							onClick={() => handleTabChange(item.name, `settings/authentications/${item.href}`)}
						/>
					))}
				</nav>
				{searchParams.get('a') === AUTH_TABS.GENERAL && (
					<>
						<SelectUserDataModel />
						<RedirectURLs />
						<EmailAuthentication />
						<PhoneAuthentication />
					</>
				)}
				{searchParams.get('a') === AUTH_TABS.PROVIDERS && <SelectOAuthProviders />}
				{searchParams.get('a') === AUTH_TABS.TEMPLATES && <MessageTemplates />}
			</div>
		</SettingsContainer>
	);
}
