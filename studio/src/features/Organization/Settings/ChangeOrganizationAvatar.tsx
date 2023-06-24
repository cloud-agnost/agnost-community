import '˜/styles/changeAvatar.scss';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import useAuthStore from '@/store/auth/authStore.ts';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { CircleNotch, Trash } from '@phosphor-icons/react';
import { ChangeEvent, useId, useRef, useState } from 'react';
import { APIError } from '@/types';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import useOrganizationStore from '@/store/organization/organizationStore';

export default function ChangeOrganizationAvatar() {
	const [loading, setLoading] = useState(false);

	const [error, setError] = useState<APIError | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const filePickerId = useId();

	const { organization, changeOrganizationAvatar, removeOrganizationAvatar } =
		useOrganizationStore();
	async function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
		if (!e.target.files?.length) return;
		const [file] = e.target.files;
		setLoading(true);
		changeOrganizationAvatar({
			picture: file,
			organizationId: organization?._id as string,
			onSuccess: () => {
				setLoading(false);
			},
			onError: (error: APIError) => {
				setError(error);
				setLoading(false);
			},
		});
	}

	async function onClickHandler() {
		setError(null);
		setLoading(true);
		removeOrganizationAvatar({
			onSuccess: () => {
				setLoading(false);
			},
			onError: (error: APIError) => {
				setError(error);
				setLoading(false);
			},
		});
	}
	return (
		<>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error.error}</AlertTitle>
					<AlertDescription>{error.details}</AlertDescription>
				</Alert>
			)}
			<div className='avatar-container'>
				<div className='avatar-actions'>
					<input
						ref={fileInput}
						onChange={onChangeHandler}
						id={filePickerId}
						type='file'
						className='hidden'
					/>
					<label htmlFor={filePickerId}>
						<Avatar size='2xl' square>
							<AvatarImage
								src={
									location.protocol + '//' + location.hostname + '/api' + organization?.pictureUrl
								}
							/>
							{organization && (
								<AvatarFallback color={organization?.color} name={organization?.name} />
							)}
						</Avatar>
					</label>
					{loading && <CircleNotch size={48} className='loading avatar-actions-loading' />}
					<div className='avatar-actions-button'>
						{organization?.pictureUrl && (
							<Button onClick={onClickHandler} variant='blank' size='sm'>
								<Trash className='avatar-actions-icon' />
							</Button>
						)}
						<Button variant='blank' size='sm' disabled={loading}>
							<label htmlFor={filePickerId}>
								<Pencil className='avatar-actions-icon' />
							</label>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
