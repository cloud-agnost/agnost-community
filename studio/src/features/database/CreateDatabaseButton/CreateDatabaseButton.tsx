import { Button } from 'components/Button';
import { useState } from 'react';
import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

export default function CreateDatabaseButton() {
	const [open, setOpen] = useState(false);
	const canCreate = useAuthorizeVersion('db.create');
	return (
		<>
			<Button onClick={() => setOpen(true)} disabled={!canCreate}>
				Create Database
			</Button>
			<CreateAndEditDatabaseDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
