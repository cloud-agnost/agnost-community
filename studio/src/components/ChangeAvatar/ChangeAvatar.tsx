import { APIError } from '@/types';
import { CircleNotch, Trash } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { ChangeEvent, useId, useRef } from 'react';
import './changeAvatar.scss';
import { cn } from '@/utils';
import { Description } from '../Description';
interface ChangeAvatarProps {
	item: {
		name: string;
		color: string;
		pictureUrl: string;
		_id: string;
	};
	onChange: (file: File) => void;
	removeAvatar: () => void;
	error: APIError | null;
	loading: boolean;
	title?: string;
	description?: string;
	className?: string;
}

export default function ChangeAvatar({
	item,
	onChange,
	removeAvatar,
	error,
	loading,
	title,
	description,
	className,
}: ChangeAvatarProps) {
	const fileInput = useRef<HTMLInputElement>(null);
	const filePickerId = useId();

	async function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
		if (!e.target.files?.length) return;
		const [file] = e.target.files;
		onChange(file);
	}

	async function onClickHandler() {
		removeAvatar();
	}
	return (
		<>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error.error}</AlertTitle>
					<AlertDescription>{error.details}</AlertDescription>
				</Alert>
			)}
			<div className={cn('avatar-container', className)}>
				{title && <Description title={title}>{description}</Description>}
				<div className='avatar-actions'>
					<input
						ref={fileInput}
						onChange={onChangeHandler}
						id={filePickerId}
						type='file'
						className='hidden'
					/>
					<label htmlFor={filePickerId}>
						<Avatar size='3xl' square>
							<AvatarImage
								src={location.protocol + '//' + location.hostname + '/api' + item?.pictureUrl}
							/>
							{item && <AvatarFallback color={item?.color} name={item?.name} />}
						</Avatar>
					</label>
					{loading && <CircleNotch size={48} className='loading avatar-actions-loading' />}
					<div className='avatar-actions-button'>
						{item?.pictureUrl && (
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
