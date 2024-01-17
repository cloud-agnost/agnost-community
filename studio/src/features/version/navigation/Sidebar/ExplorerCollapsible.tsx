import { Button } from '@/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible';
import { cn } from '@/utils';
import { CaretRight } from '@phosphor-icons/react';

interface ExplorerCollapsibleProps {
	open: boolean;
	onOpenChange: () => void;
	children: React.ReactNode;
	trigger?: React.ReactNode;
}
export function ExplorerCollapsible({
	open,
	onOpenChange,
	children,
	trigger,
	...props
}: ExplorerCollapsibleProps) {
	return (
		<Collapsible open={open} onOpenChange={onOpenChange} className='w-full' {...props}>
			{trigger}
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	);
}
export function ExplorerCollapsibleTrigger({
	title,
	children,
	active,
}: {
	title?: string;
	children?: React.ReactNode;
	active: boolean;
}) {
	return (
		<div className='hover:bg-wrapper-background-hover group h-7 flex items-center justify-center'>
			<div className='flex items-center justify-start gap-1 w-full pl-1'>
				<CollapsibleTrigger asChild>
					<Button variant='blank' className='gap-1'>
						<CaretRight
							size={16}
							className={cn('transition-transform duration-200', active && 'rotate-90')}
						/>
						{title && <h1 className='flex-1 text-left font-normal'>{title}</h1>}
					</Button>
				</CollapsibleTrigger>
				<div className='flex-1 flex justify-between items-center'>{children}</div>
			</div>
		</div>
	);
}
