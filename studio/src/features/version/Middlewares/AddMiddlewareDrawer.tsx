import { useTabNavigate, useToast } from '@/hooks';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Middleware, TabTypes } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { Form } from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import MiddlewareForm from './MiddlewareForm';
import { MiddlewareSchema } from '@/types';
interface AddMiddlewareDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate?: (middleware: Middleware) => void;
}

export default function AddMiddlewareDrawer({
	open,
	onOpenChange,
	onCreate,
}: AddMiddlewareDrawerProps) {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);
	const { createMiddleware } = useMiddlewareStore();
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	const { orgId, appId, versionId } = useParams();

	useEffect(() => {
		if (!open) form.reset();
	}, [open]);

	const form = useForm<z.infer<typeof MiddlewareSchema>>({
		resolver: zodResolver(MiddlewareSchema),
		defaultValues: {
			name: '',
		},
	});
	async function onSubmit(data: z.infer<typeof MiddlewareSchema>) {
		if (!orgId || !appId || !versionId) return;
		setLoading(true);
		await createMiddleware({
			orgId,
			appId,
			versionId,
			name: data.name,
			onSuccess: (mw) => {
				notify({
					title: t('general.success'),
					description: t('version.middleware.add.success'),
					type: 'success',
				});
				onOpenChange(false);
				if (onCreate) onCreate(mw);
				else {
					navigate({
						title: data.name,
						path: `${pathname}/${mw._id}`,
						isActive: true,
						isDashboard: false,
						type: TabTypes.Middleware,
					});
				}
				setLoading(false);
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: error.error,
					description: error.details,
				});
				setLoading(false);
			},
		});
	}
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.add_middleware')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6' onSubmit={form.handleSubmit(onSubmit)}>
						<MiddlewareForm loading={loading} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
