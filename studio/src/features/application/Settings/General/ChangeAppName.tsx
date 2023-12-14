import { ChangeNameForm } from '@/components/ChangeNameForm';
import { useToast } from '@/hooks';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import { ChangeNameFormSchema } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/Form';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
export default function ChangeAppName() {
	const { t } = useTranslation();
	const { application, changeAppName } = useApplicationStore();
	const canEdit = useAuthorizeApp('update');
	const { notify } = useToast();
	const { orgId } = useParams() as Record<string, string>;
	const form = useForm<z.infer<typeof ChangeNameFormSchema>>({
		defaultValues: {
			name: application?.name as string,
		},
	});

	const {
		mutateAsync: changeNameMutate,
		isPending,
		error,
	} = useMutation({
		mutationFn: changeAppName,
		onSuccess: () => {
			notify({
				title: t('application.edit.name.success') as string,
				description: t('application.edit.name.successDesc') as string,
				type: 'success',
			});
		},
	});
	async function onSubmit(data: z.infer<typeof ChangeNameFormSchema>) {
		changeNameMutate({
			name: data.name,
			appId: application?._id as string,
			orgId,
		});
	}

	return (
		<Form {...form}>
			<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
				<ChangeNameForm
					label={t('application.edit.name.title') as string}
					loading={isPending}
					error={error}
					disabled={!canEdit}
				/>
			</form>
		</Form>
	);
}
