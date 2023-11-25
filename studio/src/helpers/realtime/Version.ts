import useVersionStore from '@/store/version/versionStore';
import { RealtimeActionParams, Version as VersionType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Version extends RealtimeActions<VersionType> {
	redeploy(param: RealtimeActionParams<VersionType>): void {
		this.update(param);
	}
	deploy(param: RealtimeActionParams<VersionType>): void {
		this.update(param);
	}
	delete(param: RealtimeActionParams<VersionType>): void {
		useVersionStore.setState?.({
			versions: useVersionStore
				.getState?.()
				.versions.filter((env) => env._id !== param.identifiers.environmentId),
		});
	}
	update(param: RealtimeActionParams<VersionType>): void {
		console.log('updat2e', param.data.name);
		useVersionStore.setState?.((prev) => ({
			versions: prev.versions.map((version) => {
				console.log(version._id, param.data._id);
				if (version._id === param.data._id) {
					return param.data;
				}
				return version;
			}),
			version: param.data,
		}));
	}
	create(param: RealtimeActionParams<VersionType>): void {
		useVersionStore.setState?.({
			versions: [...useVersionStore.getState().versions, param.data],
		});
	}
	telemetry(param: RealtimeActionParams<VersionType>): void {
		this.update(param);
	}
	log(): void {
		return;
	}
}

export default Version;
