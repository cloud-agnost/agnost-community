import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { APIError, ModelSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/Form';
import { z } from 'zod';
import ModelForm from './ModelForm';
import useModelStore from '@/store/database/modelStore';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import { useEffect } from 'react';
export default function CreateModel({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { t } = useTranslation();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof ModelSchema>>({
		resolver: zodResolver(ModelSchema),
		defaultValues: {
			timestamps: {
				createdAt: t('database.models.add.timestamps.createdAt.name') as string,
				updatedAt: t('database.models.add.timestamps.updatedAt.name') as string,
			},
		},
	});
	const { versionId, appId, orgId, dbId } = useParams() as {
		versionId: string;
		appId: string;
		orgId: string;
		dbId: string;
	};
	const { createModel } = useModelStore();

	const { mutateAsync: createModelMutation, isPending } = useMutation({
		mutationFn: createModel,
		mutationKey: ['createModel'],
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
		onSettled: () => onClose(),
	});
	async function onSubmit(data: z.infer<typeof ModelSchema>) {
		createModelMutation({
			versionId,
			appId,
			orgId,
			dbId,
			...data,
		});
	}
	function onClose() {
		form.reset({
			name: '',
			description: '',
		});
		onOpenChange(false);
	}

	useEffect(() => {
		if (open) {
			form.reset({
				timestamps: {
					createdAt: t('database.models.add.timestamps.createdAt.name') as string,
					updatedAt: t('database.models.add.timestamps.updatedAt.name') as string,
				},
			});
		}
	}, [open]);
	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>{t('database.models.create')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
							<ModelForm loading={isPending} />
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
