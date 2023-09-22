import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useFunctionStore from '@/store/function/functionStore';
import { CreateTaskSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import FunctionForm from './FunctionForm';
interface EditTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function EditTask({ open, onClose }: EditTaskProps) {
	const { t } = useTranslation();
	const { updateFunction, function: helper } = useFunctionStore();
	const { notify } = useToast();
	const { versionId, appId, orgId, funcId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		funcId: string;
	}>();

	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
	});

	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		updateFunction({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			funcId: funcId as string,
			...data,
			onSuccess: () => {
				onClose();
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	useEffect(() => {
		if (helper) {
			form.reset(helper);
		}
	}, [helper]);
	return (
		<Drawer
			open={open}
			onOpenChange={() => {
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('function.edit', {
							name: helper.name,
						})}
					</DrawerTitle>
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
