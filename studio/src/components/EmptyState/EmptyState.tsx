import { useTabIcon } from '@/hooks';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { AppWindow, Bell, Envelope, GlobeSimple, Key, Users } from '@phosphor-icons/react';
import React, { ElementType } from 'react';
import { EnvironmentVariable, NpmPackage, RateLimit, Storage } from '../icons';

export type Modules =
	| 'org'
	| 'app'
	| TabTypes.Endpoint
	| TabTypes.MessageQueue
	| TabTypes.File
	| TabTypes.Database
	| TabTypes.Model
	| TabTypes.Task
	| TabTypes.Field
	| TabTypes.Bucket
	| TabTypes.Storage
	| TabTypes.Middleware
	| TabTypes.Function
	| TabTypes.Cache
	| TabTypes.Notifications
	| 'invitation'
	| 'resource'
	| 'apiKey'
	| 'variable'
	| 'package'
	| 'rate-limit'
	| 'custom-domain';

interface EmptyStateProps {
	title: string;
	children?: React.ReactNode;
	type: Modules;
	className?: string;
}

export default function EmptyState({ type, title, className, children }: EmptyStateProps) {
	const ICON_MAP: Record<string, ElementType> = {
		apiKey: Key,
		variable: EnvironmentVariable,
		package: NpmPackage,
		'rate-limit': RateLimit,
		invitation: Envelope,
		app: AppWindow,
		resource: Storage,
		org: Users,
		notification: Bell,
		'custom-domain': GlobeSimple,
	};
	const getTabIcon = useTabIcon('w-16 h-16');
	const Icon = ICON_MAP[type];

	return (
		<div className={cn('flex flex-col items-center justify-center gap-4 h-[95%]', className)}>
			<div className='border-2 border-border p-4 rounded-full bg-border'>
				{Icon ? <Icon className='w-8 h-8 text-default' /> : getTabIcon(type as TabTypes)}
			</div>
			<h2 className='text-default text-xs font-normal leading-6 font-sfCompact'>{title}</h2>
			{children}
		</div>
	);
}
