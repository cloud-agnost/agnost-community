import { TAB_ICON_MAP } from '@/constants';
import { cn } from '@/utils';
import { Key } from '@phosphor-icons/react';
import React, { ElementType } from 'react';
import useThemeStore from '@/store/theme/themeStore';
import {
	EmptyInvitation,
	EmptyInvitationLight,
	EnvironmentVariable,
	NpmPackage,
	RateLimit,
	EmptyApps,
	EmptyAppsLight,
	EmptyResource,
	EmptyResourceLight,
	EmptyOrg,
	EmptyOrgLight,
} from '../icons';
import './emptyState.scss';
import { capitalize } from 'lodash';

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
	| 'cache';

interface EmptyStateProps {
	title: string;
	children?: React.ReactNode;
	type: Modules;
	className?: string;
}

export default function EmptyState({ type, title, className, children }: EmptyStateProps) {
	const { theme } = useThemeStore();
	const ICON_MAP: Record<string, ElementType> = {
		apiKey: Key,
		variable: EnvironmentVariable,
		package: NpmPackage,
		'rate-limit': RateLimit,
		invitation: theme === 'light' ? EmptyInvitationLight : EmptyInvitation,
		app: theme === 'light' ? EmptyAppsLight : EmptyApps,
		resource: theme === 'light' ? EmptyResourceLight : EmptyResource,
		org: theme === 'light' ? EmptyOrgLight : EmptyOrg,
	};
	const Icon = TAB_ICON_MAP[capitalize(type)] ?? ICON_MAP[type];
	return (
		<div className={cn('empty-state h-[95%]', className)}>
			{<Icon className='w-44 h-44 text-icon-secondary' />}
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
