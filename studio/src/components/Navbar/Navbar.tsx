import { cn } from '@/utils';
import { NavLink } from 'react-router-dom';
import './navbar.scss';

export interface Item {
	title: string;
	href: string;
	icon: React.ElementType;
}

interface Props {
	className?: string;
	items: Item[];
}

export function Navbar({ items, className }: Props): JSX.Element {
	return (
		<nav className={cn('navbar', className)}>
			{items.map((item) => (
				<NavLink className='navbar-item' to={item.href} key={item.title} end>
					<span className='navbar-item-icon'>
						<item.icon />
					</span>
					<span className='navbar-item-text'>{item.title}</span>
				</NavLink>
			))}
		</nav>
	);
}
