import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { useTabNavigate } from '@/hooks';
import { Fragment } from 'react';
import { Button } from 'components/Button';
import { cn } from '@/utils';
import { useParams } from 'react-router-dom';
import useTabStore from '@/store/version/tabStore';
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
	const navigate = useTabNavigate();
	const { getCurrentTab } = useTabStore();
	const { versionId } = useParams() as { versionId: string };
	return (
		<div className={cn('shrink-0 flex items-center gap-x-6', className)}>
			<Button to={goBackLink} className='text-lg border-none h-8 w-8 p-0' variant='secondary'>
				<ArrowLeft weight='bold' />
			</Button>
			<div className='flex items-center gap-2 text-sm leading-6'>
				{filteredItems.map((item, index) => {
					const Component = item.url ? Button : 'span';
					return (
						<Fragment key={index}>
							<Component
								variant='blank'
								className={cn(
									'hover:text-default',
									item.url && 'hover:underline',
									index === filteredItems.length - 1 ? 'text-default' : 'text-subtle',
								)}
								onClick={() => {
									navigate({
										id: getCurrentTab(versionId)?.id as string,
										title: item.name as string,
										path: item.url as string,
										isActive: true,
										isDashboard: false,
									});
								}}
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
