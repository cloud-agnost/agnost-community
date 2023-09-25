import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useFunctionStore from '@/store/function/functionStore';
import { CreateFunctionSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import FunctionForm from './FunctionForm';
interface CreateTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateFunction({ open, onClose }: CreateTaskProps) {
	const { t } = useTranslation();
	const { createFunction } = useFunctionStore();
	const { notify } = useToast();
	const navigate = useTabNavigate();
	const form = useForm<z.infer<typeof CreateFunctionSchema>>({
		resolver: zodResolver(CreateFunctionSchema),
	});
	const { pathname } = useLocation();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	function onSubmit(data: z.infer<typeof CreateFunctionSchema>) {
		createFunction({
			...data,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: (helper) => {
				form.reset({
					name: '',
				});
				navigate({
					title: helper.name,
					path: `${pathname}/${helper._id}`,
					isActive: true,
					isDashboard: false,
					type: 'Function',
				});
				onClose();
			},
			onError: ({ error, details }) => {
				form.reset({
					name: '',
				});
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	return (
		<Drawer
			open={open}
			onOpenChange={() => {
				form.reset({
					name: '',
				});
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('function.add')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<FunctionForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
