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
import { Button } from 'components/Button';

interface AddAPIKeyDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddAPIKeyDrawer({ open, onOpenChange }: AddAPIKeyDrawerProps) {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

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
				allowedEndpoints: undefined,
				excludedEndpoints: undefined,
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
			console.log(form.getValues());
			console.log(form.formState.errors);
		}
	}, [open]);

	const activeTab = searchParams.get('t') || 'general';

	const tabs: Record<string, ReactNode> = {
		general: <AddAPIKeyGeneral />,
		'allowed-domains': <AddAPIKeyAllowedDomains />,
		'allowed-ips': <AddAPIKeyAllowedIPs />,
	};

	async function onSubmit(data: z.infer<typeof Schema>) {
		console.log(data);
	}

	return (
		<FormProvider {...form}>
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent position='right'>
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
						<div className='flex justify-end border-none p-6 !pt-0'>
							<Button size='lg'>{t('general.save')}</Button>
						</div>
					</form>
				</DrawerContent>
			</Drawer>
		</FormProvider>
	);
}
