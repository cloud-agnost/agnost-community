import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Button } from 'components/Button';
import { cn } from '@/utils';

export interface BreadCrumbItem {
	name?: string;
	url?: string;
}

type BreadCrumbProps = {
	goBackLink: string;
	className?: string;
	items: BreadCrumbItem[];
};

export default function BreadCrumb({ goBackLink, className, items }: BreadCrumbProps) {
	const filteredItems = items.filter((item) => Boolean(item.name));
	return (
		<div className={cn('shrink-0 flex items-center gap-x-6', className)}>
			<Button to={goBackLink} className='text-lg border-none h-8 w-8 p-0' variant='secondary'>
				<ArrowLeft weight='bold' />
			</Button>
			<div className='flex items-center gap-2 text-sm leading-6'>
				{filteredItems.map((item, index) => {
					const Component = item.url ? Link : 'span';
					return (
						<Fragment key={index}>
							<Component
								to={item.url ?? ''}
								className={cn(
									'hover:text-default',
									item.url && 'hover:underline',
									index === filteredItems.length - 1 ? 'text-default' : 'text-subtle',
								)}
							>
								{item.name}
							</Component>
							{index !== filteredItems.length - 1 && (
								<CaretRight className='text-icon-base' weight='bold' size={20} />
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
