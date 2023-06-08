'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import './avatar.scss';
const avatarVariants = cva('avatar', {
	variants: {
		size: {
			xs: 'avatar-xs',
			sm: 'avatar-sm',
			md: 'avatar-md',
			lg: 'avatar-lg',
			xl: 'avatar-xl',
		},
		defaultVariants: {
			size: 'md',
		},
	},
});

export interface AvatarProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
		VariantProps<typeof avatarVariants> {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface AvatarImageProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
	className?: string;
}

export interface AvatarFallbackProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
	className?: string;
	name?: string;
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
	({ size, className, ...props }, ref) => (
		<AvatarPrimitive.Root
			ref={ref}
			className={cn(avatarVariants({ size, className }))}
			{...props}
		/>
	),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	AvatarImageProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image ref={ref} className={cn('avatar-image', className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	AvatarFallbackProps
>(({ className, ...props }, ref) => {
	const { name = '' } = props;
	return (
		<AvatarPrimitive.Fallback ref={ref} className={cn('avatar-fallback', className)} {...props}>
			{name.slice(0, 2).toUpperCase()}
		</AvatarPrimitive.Fallback>
	);
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
