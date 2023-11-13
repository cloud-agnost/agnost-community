import EditTask from '@/features/task/EditTask';
import useTaskStore from '@/store/task/taskStore';
import { Outlet } from 'react-router-dom';
export default function VersionTask() {
	const { isEditTaskModalOpen, closeEditTaskModal } = useTaskStore();
	return (
		<>
			<EditTask open={isEditTaskModalOpen} onClose={closeEditTaskModal} />
			<Outlet />
		</>
	);
}
