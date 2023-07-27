import { ChangeAvatar } from '@/components/ChangeAvatar';
import useApplicationStore from '@/store/app/applicationStore';
import { APIError } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
export default function ChangeAppAvatar() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const { application, setAppAvatar, removeAppAvatar } = useApplicationStore();
	const { notify } = useToast();
	async function onChangeHandler(file: File) {
		setLoading(true);
		console.log('file', file);
		setAppAvatar({
			picture: file,
			appId: application?._id as string,
			onSuccess: () => {
				setLoading(false);
			},
			onError: (error: APIError) => {
				setError(error);
				setLoading(false);
			},
		});
	}

	async function removeHandler() {
		setError(null);
		setLoading(true);
		removeAppAvatar({
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('application.edit.avatar.success'),
					description: t('application.edit.avatar.successDesc'),
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
		<ChangeAvatar
			item={{
				name: application?.name as string,
				color: application?.color as string,
				pictureUrl: application?.pictureUrl as string,
				_id: application?._id as string,
			}}
			onChange={onChangeHandler}
			removeAvatar={removeHandler}
			error={error}
			loading={loading}
			title={t('application.edit.avatar.title') as string}
			description={t('application.edit.avatar.description') as string}
			className='flex items-center gap-32'
		/>
	);
}
