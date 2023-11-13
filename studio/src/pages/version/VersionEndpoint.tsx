import { EditEndpointDrawer } from '@/features/endpoints';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { Outlet } from 'react-router-dom';
export default function VersionEndpoint() {
	const { closeEditEndpointDialog, isEditEndpointDialogOpen } = useEndpointStore();
	return (
		<>
			<EditEndpointDrawer open={isEditEndpointDialogOpen} onClose={closeEditEndpointDialog} />
			<Outlet />
		</>
	);
}
