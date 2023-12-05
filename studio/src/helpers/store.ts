// import { STATE_LIST } from '@/constants/stateList';
import localforage from 'localforage';
import { StateCreator, create as _create } from 'zustand';
const storeResetFns = new Set<() => void>();

export const resetAllStores = () => {
	localStorage.clear();
	localforage.clear();
};

export const create = (<T>() => {
	return (stateCreator: StateCreator<T>) => {
		const store = _create(stateCreator);
		const initialState = store.getState();
		storeResetFns.add(() => {
			store.setState(initialState, true);
		});
		return store;
	};
}) as typeof _create;
