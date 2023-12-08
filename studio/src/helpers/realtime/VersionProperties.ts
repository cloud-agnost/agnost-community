import { RealtimeActionParams, Version as VersionType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
import Version from './Version';
class VersionProperties extends RealtimeActions<VersionType> {
	accept(): void {
		throw new Error('Method not implemented.');
	}
	version = new Version();
	delete(param: RealtimeActionParams<VersionType>): void {
		this.version.update(param);
	}
	update(param: RealtimeActionParams<VersionType>): void {
		this.version.update(param);
	}
	create(param: RealtimeActionParams<VersionType>): void {
		this.version.update(param);
	}
	telemetry(): void {
		throw new Error('Method not implemented.');
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
}

export default VersionProperties;
