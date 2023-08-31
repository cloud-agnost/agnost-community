import { Button } from '@/components/Button';
import { useTabNavigate } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn } from '@/utils';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
interface TabLinkProps {
	className?: string;
	name: string;
	path: string;
}

export default function TabLink({ className, name, path, ...props }: TabLinkProps) {
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	const { getCurrentTab } = useTabStore();
	const { versionId } = useParams() as { versionId: string };
	return (
		<Button
			variant='blank'
			onClick={() =>
				navigate({
					id: getCurrentTab(versionId)?.id as string,
					title: name,
					path: `${pathname}/${path}`,
					isActive: true,
					isDashboard: false,
				})
			}
			className={cn('link', className)}
			{...props}
		>
			{name}
		</Button>
	);
}
