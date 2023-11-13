import { EditMessageQueue } from '@/features/queue';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { Outlet } from 'react-router-dom';
export default function VersionQueue() {
	const { isEditModalOpen, closeEditModal } = useMessageQueueStore();
	return (
		<>
			<EditMessageQueue open={isEditModalOpen} onClose={closeEditModal} />
			<Outlet />
		</>
	);
}
