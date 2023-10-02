import useAuthStore from '@/store/auth/authStore.ts';
import { Avatar, AvatarFallback, AvatarImage, AvatarProps } from 'components/Avatar';

export default function AuthUserAvatar(props: AvatarProps) {
	const { user } = useAuthStore();
	if (!user) return null;

	return (
		<Avatar {...props}>
			<AvatarImage src={user.pictureUrl} />
			<AvatarFallback isUserAvatar color={user.color} name={user.name} />
		</Avatar>
	);
}
