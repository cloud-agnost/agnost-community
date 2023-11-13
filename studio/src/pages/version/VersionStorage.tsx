import { EditStorage } from '@/features/storage';
import EditBucket from '@/features/storage/EditBucket';
import useStorageStore from '@/store/storage/storageStore';
import { Outlet } from 'react-router-dom';
export default function VersionStorage() {
	const {
		isEditStorageDialogOpen,
		closeEditStorageDialog,
		isEditBucketDialogOpen,
		closeEditBucketDialog,
	} = useStorageStore();

	return (
		<>
			<EditStorage open={isEditStorageDialogOpen} onClose={closeEditStorageDialog} />
			<EditBucket open={isEditBucketDialogOpen} onClose={closeEditBucketDialog} />

			<Outlet />
		</>
	);
}
