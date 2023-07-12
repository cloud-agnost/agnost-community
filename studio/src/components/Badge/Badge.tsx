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
			default: 'badge',
		},
		rounded: {
			true: 'badge-rounded',
		},
	},
	defaultVariants: {
		variant: 'default',
		rounded: false,
	},
});

export type BadgeColors = 'green' | 'blue' | 'yellow' | 'purple' | 'red' | 'orange';

interface BadgeProps {
	variant?: BadgeColors;
	rounded?: boolean;
	clearable?: boolean;
	text: string;
	className?: string;
}
export default function Badge({ text, variant, rounded, clearable, className }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant, rounded }), 'badge', className)}>
			{rounded && <div className='badge-dot' />}
			<span className={cn('badge-text')}>{text}</span>
			{clearable && <X className='badge-clear' size={12} />}
		</div>
	);
}
