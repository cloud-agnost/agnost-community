import React, { ElementType } from 'react';
import './emptyState.scss';
import { cn } from '@/utils';
import {
	EmptyApps,
	EmptyAppsLight,
	EmptyDatabase,
	EmptyDatabaseLight,
	EmptyTaskLight,
	EmptyTask,
	EmptyFields,
	EmptyFieldsLight,
	EmptyFilesLight,
	EmptyInvitation,
	EmptyInvitationLight,
	EmptyModels,
	EmptyModelsLight,
	EmptyQueue,
	EmptyQueueLight,
	EmptyEndpoint,
	EmptyBucket,
	EmptyFile,
	Middleware,
	ApiKeys,
	EnvironmentVariable,
	NpmPackage,
	RateLimit,
	EmptyBucketLight,
	Storage,
} from '../icons';
import { Function, Key } from '@phosphor-icons/react';
import useThemeStore from '@/store/theme/themeStore';

export type Modules =
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

const ICON_MAP: Record<Modules, ElementType> = {
	app: EmptyApps,
	database: EmptyDatabase,
	task: EmptyTask,
	field: EmptyFields,
	file: EmptyFile,
	invitation: EmptyInvitation,
	model: EmptyModels,
	queue: EmptyQueue,
	endpoint: ApiKeys,
	bucket: EmptyBucket,
	storage: Storage,
	middleware: Middleware,
	resource: EmptyDatabase,
	function: Function,
	apiKey: Key,
	variable: EnvironmentVariable,
	package: NpmPackage,
	'rate-limit': RateLimit,
	cache: EmptyDatabase,
};

const LIGHT_ICON_MAP: Record<Modules, ElementType> = {
	app: EmptyAppsLight,
	database: EmptyDatabaseLight,
	task: EmptyTaskLight,
	field: EmptyFieldsLight,
	file: EmptyFilesLight,
	invitation: EmptyInvitationLight,
	model: EmptyModelsLight,
	queue: EmptyQueueLight,
	endpoint: ApiKeys,
	bucket: EmptyBucketLight,
	storage: Storage,
	middleware: Middleware,
	resource: EmptyDatabaseLight,
	function: Function,
	apiKey: Key,
	variable: EnvironmentVariable,
	package: NpmPackage,
	'rate-limit': RateLimit,
	cache: EmptyDatabaseLight,
};

export default function EmptyState({ type, title, className, children }: EmptyStateProps) {
	const { theme } = useThemeStore();
	const Icon = theme === 'light' ? LIGHT_ICON_MAP[type] : ICON_MAP[type];
	return (
		<div className={cn('empty-state', className)}>
			{<Icon className='w-44 h-44 text-icon-secondary' />}
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
