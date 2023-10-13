import { RealtimeObjectTypes } from '@/types';
import Application from './Application';
import Database from './Database';
import Endpoint from './Endpoint';
import Environment from './Environment';
import Field from './Field';
import Model from './Model';
import Organization from './Organization';
import Queue from './Queue';
import Resource from './Resources';
import Storage from './Storage';
import Task from './Task';
import User from './User';
import Version from './Version';
export function realtimeObjectMapper(type: RealtimeObjectTypes) {
	const keys = {
		user: User,
		org: Organization,
		'org.app': Application,
		'org.resource': Resource,
		app: Application,
		resource: Resource,
		queue: Queue,
		'org.app.version.queue': Queue,
		task: Task,
		'org.app.version.task': Task,
		endpoint: Endpoint,
		'org.app.version.endpoint': Endpoint,
		'org.app.version.environment': Environment,
		'org.app.version.keys': Version,
		'org.app.version.limits': Version,
		'org.app.version.version': Version,
		version: Version,
		'org.app.version.db': Database,
		'org.app.version.db.model': Model,
		'org.app.version.db.model.field': Field,
		'org.app.version.storage': Storage,
		'org.app.version.cache': Cache,
		// TODO: "org.resource.log"
	};
	return new keys[type]();
}
