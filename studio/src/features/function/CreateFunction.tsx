import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useFunctionStore from '@/store/function/functionStore';
import { APIError, CreateFunctionSchema, TabTypes } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import FunctionForm from './FunctionForm';
import { useMutation } from '@tanstack/react-query';
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
	const { mutate: createFunctionMutation, isPending } = useMutation({
		mutationFn: createFunction,
		onSuccess: (helper) => {
			navigate({
				title: helper.name,
				path: `${pathname}/${helper._id}`,
				isActive: true,
				isDashboard: false,
				type: TabTypes.Function,
			});
			handleClose();
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	function onSubmit(data: z.infer<typeof CreateFunctionSchema>) {
		createFunctionMutation({
			...data,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	function handleClose() {
		form.reset({
			name: '',
		});
		onClose();
	}

	return (
		<Drawer open={open} onOpenChange={handleClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('function.add')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<FunctionForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
