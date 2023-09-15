import { Button } from '@/components/Button';
import { useTabNavigate } from '@/hooks';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { useLocation } from 'react-router-dom';
interface TabLinkProps {
	className?: string;
	name: string;
	path: string;
	type: TabTypes;
	onClick?: () => void;
}

export default function TabLink({ className, name, path, onClick, type, ...props }: TabLinkProps) {
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	return (
		<Button
			variant='blank'
			onClick={() => {
				onClick?.();
				navigate({
					title: name,
					path: `${pathname}/${path}`,
					isActive: true,
					isDashboard: false,
					type,
				});
			}}
			className={cn(className, 'link')}
			{...props}
		>
			{name}
		</Button>
	);
}
