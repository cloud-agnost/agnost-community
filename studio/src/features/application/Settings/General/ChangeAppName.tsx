import { ChangeNameForm } from '@/components/ChangeNameForm';
import useApplicationStore from '@/store/app/applicationStore';
import { APIError } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
export default function ChangeAppName() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const { application, changeAppName } = useApplicationStore();
	const { notify } = useToast();

	function onFormSubmit(data: any) {
		setError(null);
		setLoading(true);
		changeAppName({
			name: data.name,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('application.edit.name.success') as string,
					description: t('application.edit.name.successDesc') as string,
					type: 'success',
				});
			},
			onError: (error: APIError) => {
				setError(error);
				setLoading(false);
			},
		});
	}
	return (
		<ChangeNameForm
			label={t('application.edit.name.title') as string}
			onFormSubmit={onFormSubmit}
			loading={loading}
			error={error}
			defaultValue={application?.name as string}
		/>
	);
}
