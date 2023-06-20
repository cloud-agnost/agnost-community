import { cva } from 'class-variance-authority';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import './badge.scss';
const badgeVariants = cva('badge', {
	variants: {
		variant: {
			green: 'badge-green',
			blue: 'badge-blue',
			yellow: 'badge-yellow',
			purple: 'badge-purple',
			red: 'badge-red',
			orange: 'badge-orange',
		},
		rounded: {
			true: 'badge-rounded',
		},
	},
	defaultVariants: {
		variant: 'green',
		rounded: false,
	},
});

interface BadgeProps {
	variant?: 'green' | 'blue' | 'yellow' | 'purple' | 'red' | 'orange';
	rounded?: boolean;
	clearable?: boolean;
	children?: React.ReactNode;
}
export default function Badge({ children, variant, rounded, clearable }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant, rounded }), 'badge')}>
			{rounded && <div className='badge-dot' />}
			<span className='badge-text'>
				{/* {application.team.find((member) => member._id !== user?._id)?.role} */}
				{children}
			</span>
			{clearable && <X className='badge-clear' size={12} />}
		</div>
	);
}
