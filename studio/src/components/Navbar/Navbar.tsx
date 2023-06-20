import { cn } from '@/utils';
import { NavLink } from 'react-router-dom';
import './navbar.scss';

export interface Item {
	title: string;
	href: string;
	icon: React.ElementType;
}

interface Props {
	classname?: string;
	items: Item[];
}

export function Navbar({ items, classname }: Props): JSX.Element {
	return (
		<nav className={cn('navbar', classname)}>
			{items.map((item, index) => (
				<NavLink className='navbar-item' to={item.href} key={index} end>
					<span className='navbar-item-icon'>
						<item.icon />
					</span>
					<span className='navbar-item-text'>{item.title}</span>
				</NavLink>
			))}
		</nav>
	);
}
