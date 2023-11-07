import { EditFunction } from '@/features/function';
import useFunctionStore from '@/store/function/functionStore';
import { Outlet } from 'react-router-dom';
export default function VersionFunction() {
	const { isEditFunctionDrawerOpen, closeEditFunctionDrawer } = useFunctionStore();

	return (
		<>
			<EditFunction open={isEditFunctionDrawerOpen} onClose={closeEditFunctionDrawer} />
			<Outlet />
		</>
	);
}
