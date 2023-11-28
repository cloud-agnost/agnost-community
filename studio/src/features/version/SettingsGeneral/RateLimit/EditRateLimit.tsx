import { Form } from '@/components/Form';
import { APIError, CreateRateLimitSchema } from '@/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import RateLimitForm from './RateLimitForm';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import useSettingsStore from '@/store/version/settingsStore';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';

interface EditRateLimitProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditRateLimit({ open, onOpenChange }: EditRateLimitProps) {
	const { t } = useTranslation();
	const { editRateLimit, rateLimit } = useSettingsStore();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateRateLimitSchema>>({
		resolver: zodResolver(CreateRateLimitSchema),
		defaultValues: {
			errorMessage: t('version.add.rate_limiter.error_message.default').toString(),
		},
	});

	const {
		mutateAsync: editRateLimitMutate,
		isPending,
		error,
	} = useMutation({
		mutationFn: editRateLimit,
		onSuccess: () => {
			onClose();
		},
	});

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	function onSubmit(data: z.infer<typeof CreateRateLimitSchema>) {
		if (!rateLimit || !orgId || !versionId || !appId) return;
		editRateLimitMutate({
			orgId,
			versionId,
			appId,
			limitId: rateLimit?._id,
			...data,
		});
	}

	function onClose() {
		form.reset();
		onOpenChange(false);
	}

	useEffect(() => {
		if (!open) form.reset();

		if (rateLimit) {
			form.reset(rateLimit);
		}
	}, [open, rateLimit]);

	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.add_rate_limiter')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<RateLimitForm loading={isPending} error={error} />
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}