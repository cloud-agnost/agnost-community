import { ContainerType } from '@/types/container';
import { create } from 'zustand';

type ContainerState = {
	isCreateContainerDialogOpen: boolean;
	createdContainerType: ContainerType | null;
};

type Actions = {
	openCreateContainerDialog: (type: ContainerType) => void;
	closeCreateContainerDialog: () => void;
	reset: () => void;
};

const initialState: ContainerState = {
	isCreateContainerDialogOpen: false,
	createdContainerType: null,
};

const useContainerStore = create<ContainerState & Actions>((set) => ({
	...initialState,
	openCreateContainerDialog: (type) =>
		set({ isCreateContainerDialogOpen: true, createdContainerType: type }),
	closeCreateContainerDialog: () =>
		set({ isCreateContainerDialogOpen: false, createdContainerType: null }),
	reset: () => set(initialState),
}));

export default useContainerStore;
