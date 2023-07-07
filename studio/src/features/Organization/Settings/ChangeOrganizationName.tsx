import { ChangeNameForm } from '@/components/ChangeNameForm';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError } from '@/types';
import { useState } from 'react';

export default function ChangeOrganizationName() {
	const [error, setError] = useState<APIError | null>(null);
	const [loading, setLoading] = useState(false);
	const { organization, changeOrganizationName } = useOrganizationStore();

	async function onSubmit(data: any) {
		if (organization?.name === data.name) return;
		else {
			setLoading(true);
			changeOrganizationName({
				name: data.name,
				organizationId: organization?._id as string,
				onSuccess: () => {
					setLoading(false);
				},
				onError: (error) => {
					setError(error);
					setLoading(false);
				},
			});
		}
	}

	return (
		<ChangeNameForm
			onFormSubmit={onSubmit}
			loading={loading}
			error={error}
			defaultValue={organization?.name as string}
		/>
	);
}
