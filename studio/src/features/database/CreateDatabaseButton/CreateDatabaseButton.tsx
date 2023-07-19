import { Button } from 'components/Button';
import { useState } from 'react';
import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';

export default function CreateDatabaseButton() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Create Database</Button>
			<CreateAndEditDatabaseDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
