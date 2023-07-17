import { Button } from 'components/Button';
import { useState } from 'react';
import { CreateDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';

export default function CreateDatabaseButton() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Create Database</Button>
			<CreateDatabaseDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
