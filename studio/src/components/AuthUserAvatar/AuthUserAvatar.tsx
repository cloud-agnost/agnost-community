import { Avatar, AvatarFallback, AvatarImage, AvatarProps } from 'components/Avatar';
import useAuthStore from '@/store/auth/authStore.ts';

export default function AuthUserAvatar(props: AvatarProps) {
	const { user, getUserPicture } = useAuthStore();
	if (!user) return null;

	return (
		<Avatar {...props}>
			<AvatarImage src={getUserPicture()} />
			<AvatarFallback isUserAvatar color={user.color} name={user.name} />
		</Avatar>
	);
}
