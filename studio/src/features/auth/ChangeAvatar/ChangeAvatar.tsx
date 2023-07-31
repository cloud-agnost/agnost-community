import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import { CircleNotch, Trash } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { ChangeEvent, useId, useRef, useState } from 'react';
import './changeAvatar.scss';

export default function ChangeAvatar() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const filePickerId = useId();
	const { user, changeAvatar, removeAvatar } = useAuthStore();

	async function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
		if (!e.target.files?.length) return;
		const [file] = e.target.files;
		try {
			setError(null);
			setLoading(true);
			await changeAvatar(file);
		} catch (error) {
			setError(error as APIError);
		} finally {
			setLoading(false);
			if (fileInput.current) fileInput.current.value = '';
		}
	}

	async function onClickHandler() {
		try {
			setError(null);
			setLoading(true);
			await removeAvatar();
		} catch (error) {
			setError(error as APIError);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='space-y-4'>
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
						<Avatar size='2xl'>
							<AvatarImage src={location.origin + '/api' + user?.pictureUrl ?? ''} />
							{user && <AvatarFallback isUserAvatar color={user?.color} name={user?.name} />}
						</Avatar>
					</label>
					{loading && <CircleNotch size={48} className='loading avatar-actions-loading' />}
					<div className='avatar-actions-button'>
						{user?.pictureUrl && (
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
		</div>
	);
}
