import { OrganizationCreateModal } from '@/features/Organization';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
async function loader(params: any) {
	console.log(params);
	return null;
}

export default function Organization() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<OrganizationCreateModal isOpen={open} closeModal={() => setOpen(false)} />
			<Outlet
				context={{
					openCreateModal: () => setOpen(true),
					closeCreateModal: () => setOpen(false),
				}}
			/>
		</>
	);
}

Organization.loader = loader;
