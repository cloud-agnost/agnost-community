import { Form } from '@/components/Form';
import { SMTPForm } from '@/components/SMTPForm';
import { APIError, SMTPSchema } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import useClusterStore from '@/store/cluster/clusterStore';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks';
export default function ClusterSmtpForm() {
	const { t } = useTranslation();
	const { updateSmtpSettings, cluster } = useClusterStore();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof SMTPSchema>>({
		resolver: zodResolver(SMTPSchema),
		defaultValues: {
			...cluster?.smtp,
		},
	});
	const { mutateAsync: updateSmtp, isPending } = useMutation({
		mutationFn: updateSmtpSettings,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('cluster.smtpSettingsUpdatedDescription'),
				type: 'success',
			});
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});
	function onSubmit(data: z.infer<typeof SMTPSchema>) {
		updateSmtp(data);
	}
	return (
		<Form {...form}>
			<form className='space-y-6 flex flex-col max-w-2xl' onSubmit={form.handleSubmit(onSubmit)}>
				<p className='text-subtle text-sm font-sfCompact'>{t('cluster.smtpDescription')}</p>
				<SMTPForm />
				<Button type='submit' size='lg' className='self-end' loading={isPending}>
					{t('general.save')}
				</Button>
			</form>
		</Form>
	);
}
