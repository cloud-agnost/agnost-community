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
import useVersionStore from '@/store/version/versionStore';
interface CreateMiddlewareProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate?: (middleware: Middleware) => void;
}

export default function CreateMiddleware({ open, onOpenChange, onCreate }: CreateMiddlewareProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const { createMiddleware } = useMiddlewareStore();
	const navigate = useTabNavigate();
	const { getVersionDashboardPath } = useVersionStore();
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
				toast({
					title: t('version.middleware.add.success') as string,
					action: 'success',
				});
				onOpenChange(false);
				if (onCreate) onCreate(mw);
				else {
					navigate({
						title: data.name,
						path: getVersionDashboardPath(`middleware/${mw._id}`),
						isActive: true,
						isDashboard: false,
						type: TabTypes.Middleware,
					});
				}
				setLoading(false);
			},
			onError: (error) => {
				toast({
					action: 'error',
					title: error.details,
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
						<MiddlewareForm loading={loading} onSubmit={onSubmit} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
function getVersionDashboardPath(arg0: string): string {
	throw new Error('Function not implemented.');
}
