import { TAB_ICON_MAP } from '@/constants';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { AppWindow, Bell, Envelope, GlobeSimple, Key, Users } from '@phosphor-icons/react';
import React, { ElementType } from 'react';
import { EnvironmentVariable, NpmPackage, RateLimit, Storage } from '../icons';
import './emptyState.scss';

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
	const Icon = TAB_ICON_MAP[type as TabTypes] ?? ICON_MAP[type];
	return (
		<div className={cn('empty-state h-[95%]', className)}>
			{<Icon className='w-44 h-44 text-icon-base' />}
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
