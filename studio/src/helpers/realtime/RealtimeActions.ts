import { RealtimeActionParams } from '@/types';

export abstract class RealtimeActions<T> {
	abstract delete(param: RealtimeActionParams<T>): void;
	abstract update(param: RealtimeActionParams<T>): void;
	abstract create(param: RealtimeActionParams<T>): void;
	abstract telemetry(param: RealtimeActionParams<T>): void;
	abstract info(param: RealtimeActionParams<T>): void;
}
