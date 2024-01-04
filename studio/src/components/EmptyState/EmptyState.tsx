import { TAB_ICON_MAP } from '@/constants';
import { cn } from '@/utils';
import { AppWindow, Bell, Envelope, GlobeSimple, Key, Users } from '@phosphor-icons/react';
import { capitalize } from 'lodash';
import React, { ElementType } from 'react';
import { EnvironmentVariable, NpmPackage, RateLimit, Storage } from '../icons';
import './emptyState.scss';

export type Modules =
	| 'org'
	| 'app'
	| 'endpoint'
	| 'queue'
	| 'file'
	| 'database'
	| 'model'
	| 'task'
	| 'field'
	| 'invitation'
	| 'bucket'
	| 'storage'
	| 'middleware'
	| 'resource'
	| 'apiKey'
	| 'variable'
	| 'package'
	| 'rate-limit'
	| 'function'
	| 'cache'
	| 'notification'
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
	const Icon = TAB_ICON_MAP[capitalize(type)] ?? ICON_MAP[type];
	return (
		<div className={cn('empty-state h-[95%]', className)}>
			{<Icon className='w-44 h-44 text-icon-base' />}
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
