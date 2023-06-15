import './changeAvatar.scss';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import useAuthStore from '@/store/auth/authStore.ts';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { CircleNotch, Trash } from '@phosphor-icons/react';
import { ChangeEvent, useId, useState } from 'react';
import { APIError } from '@/types';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';

export default function ChangeAvatar() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError | null>(null);
	const filePickerId = useId();
	const { user, changeAvatar } = useAuthStore();

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
				<Avatar size='xl'>
					<AvatarImage src={user?.pictureUrl ?? ''} />
					{user && <AvatarFallback color={user?.color} name={user?.name} />}
				</Avatar>
				<div className='avatar-actions'>
					<input onChange={onChangeHandler} id={filePickerId} type='file' className='hidden' />
					<Button variant='icon' size='sm'>
						<Trash />
					</Button>
					<Button variant='icon' size='sm' disabled={loading}>
						{loading ? (
							<CircleNotch size={15} className='loading m-0' />
						) : (
							<label htmlFor={filePickerId}>
								<Pencil />
							</label>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
