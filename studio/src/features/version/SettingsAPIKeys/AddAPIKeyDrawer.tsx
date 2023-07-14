import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { ReactNode, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADD_API_KEYS_MENU_ITEMS } from '@/constants';
import { OrganizationMenuItem } from '@/features/organization';
import {
	AddAPIKeyAllowedDomains,
	AddAPIKeyAllowedIPs,
	AddAPIKeyGeneral,
	Schema,
} from '@/features/version/SettingsAPIKeys/';
import { AnimatePresence } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useVersionStore from '@/store/version/versionStore.ts';

interface AddAPIKeyDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddAPIKeyDrawer({ open, onOpenChange }: AddAPIKeyDrawerProps) {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { createAPIKey, version } = useVersionStore();

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			ip: {
				type: 'all',
				list: [{ ip: '' }],
			},
			domain: {
				type: 'all',
				list: [{ domain: '' }],
			},
			realtime: false,
			name: '',
			expiryDate: undefined,
			endpoint: {
				type: 'no-access',
				allowedEndpoints: [],
				excludedEndpoints: [
					{
						url: '/api/v1/realtime',
					},
				],
			},
		},
	});

	useEffect(() => {
		if (!open) {
			searchParams.delete('t');
			setSearchParams(searchParams);
		} else if (!searchParams.has('t')) {
			searchParams.set('t', 'general');
			setSearchParams(searchParams);
		}
	}, [open]);
	useEffect(() => {
		console.log('error', form.formState.errors);
	}, [form.formState.errors]);

	const activeTab = searchParams.get('t') || 'general';

	const tabs: Record<string, ReactNode> = {
		general: <AddAPIKeyGeneral />,
		'allowed-domains': <AddAPIKeyAllowedDomains />,
		'allowed-ips': <AddAPIKeyAllowedIPs />,
	};

	async function onSubmit(data: z.infer<typeof Schema>) {
		console.log(data);
		if (!version) return;

		await createAPIKey({
			orgId: version.orgId,
			appId: version.appId,
			versionId: version._id,
			name: data.name,
			type: data.endpoint.type,
			IPAuthorization: data.ip.type,
			domainAuthorization: data.domain.type,
			expiryDate: data.expiryDate,
			allowedEndpoints:
				data.domain.type === 'specified'
					? (data.endpoint.allowedEndpoints
							.map((endpoint) => endpoint.url)
							.filter(Boolean) as string[])
					: undefined,
			allowRealtime: data.realtime,
			excludedEndpoints:
				data.domain.type === 'specified'
					? (data.endpoint.excludedEndpoints
							.map((endpoint) => endpoint.url)
							.filter(Boolean) as string[])
					: undefined,
			authorizedDomains:
				data.domain.type === 'specified'
					? (data.domain.list.map((item) => item.domain).filter(Boolean) as string[])
					: undefined,
			authorizedIPs:
				data.ip.type === 'specified'
					? (data.ip.list.map((item) => item.ip).filter(Boolean) as string[])
					: undefined,
		});
		onOpenChange(false);
		form.reset();
	}

	return (
		<FormProvider {...form}>
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent position='right' className='overflow-auto'>
					<DrawerHeader className='border-none'>
						<DrawerTitle>{t('version.api_key.add')}</DrawerTitle>
					</DrawerHeader>
					<ul className='mx-auto flex border-b'>
						{ADD_API_KEYS_MENU_ITEMS.map((item) => {
							return (
								<OrganizationMenuItem
									key={item.name}
									item={item}
									active={window.location.search.includes(item.href)}
								/>
							);
						})}
					</ul>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<AnimatePresence>{tabs[activeTab]}</AnimatePresence>
					</form>
				</DrawerContent>
			</Drawer>
		</FormProvider>
	);
}
