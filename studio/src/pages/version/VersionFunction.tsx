import { CreateFunction, EditFunction } from '@/features/function';
import useFunctionStore from '@/store/function/functionStore';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
export default function VersionFunction() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { isEditFunctionDrawerOpen, closeEditFunctionDrawer } = useFunctionStore();

	return (
		<>
			<CreateFunction open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditFunction open={isEditFunctionDrawerOpen} onClose={closeEditFunctionDrawer} />
			<Outlet
				context={{
					isCreateModalOpen,
					setIsCreateModalOpen,
				}}
			/>
		</>
	);
}
