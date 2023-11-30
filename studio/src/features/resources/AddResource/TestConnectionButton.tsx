import { Button } from '@/components/Button';
import { TestConnection } from '@/components/icons';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
export default function TestConnectionButton({ replica }: { replica?: boolean }) {
	const { t } = useTranslation();
	const form = useFormContext();
	const { notify } = useToast();
	const { testExistingResourceConnection, resourceConfig } = useResourceStore();

	const { mutateAsync: testMutate, isPending } = useMutation({
		mutationFn: testExistingResourceConnection,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('resources.database.test_success'),
				type: 'success',
			});
		},
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
	async function testResourceConnection() {
		const isValid = await form.trigger();
		if (!isValid) return;
		const options = replica ? form.getValues().options : form.getValues().access.options;
		const access = replica ? form.getValues() : form.getValues().access;
		testMutate({
			...form.getValues(),
			access: {
				...access,
				options: options?.filter((option: any) => option.key && option.value),
				...(replica && {
					brokers: form.getValues().brokers?.map((broker: any) => broker.key) as string[],
				}),
			},
			type: resourceConfig.resourceType,
			instance: resourceConfig.instance,
			allowedRoles: form.getValues('allowedRoles'),
		});
	}
	return (
		<Button
			variant='outline'
			loading={isPending}
			onClick={testResourceConnection}
			type='button'
			size='lg'
			className='self-start'
		>
			{!isPending && <TestConnection className='w-4 h-4 text-icon-default mr-2' />}
			{t('resources.database.test')}
		</Button>
	);
}
