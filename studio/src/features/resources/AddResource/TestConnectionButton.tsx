import { Button } from '@/components/Button';
import { TestConnection } from '@/components/icons';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
export default function TestConnectionButton() {
	const { t } = useTranslation();
	const form = useFormContext();
	const { notify } = useToast();
	const { testExistingResourceConnection, resourceConfig } = useResourceStore();
	const [loading, setLoading] = useState(false);
	function testResourceConnection() {
		setLoading(true);
		testExistingResourceConnection({
			...form.getValues(),
			access: {
				...form.getValues().access,
				options: form
					.getValues()
					.access.options?.filter((option: any) => option.key && option.value),
			},
			type: resourceConfig.resourceType,
			instance: resourceConfig.instance,
			allowedRoles: form.getValues('allowedRoles'),
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('resources.database.test_success'),
					type: 'success',
				});
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}
	return (
		<Button
			variant='outline'
			loading={loading}
			onClick={testResourceConnection}
			type='button'
			size='lg'
			className='self-start'
		>
			{!loading && <TestConnection className='w-4 h-4 text-icon-default mr-2' />}
			{t('resources.database.test')}
		</Button>
	);
}
