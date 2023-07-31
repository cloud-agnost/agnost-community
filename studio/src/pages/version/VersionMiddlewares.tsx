import { Middlewares } from '@/features/version/Middlewares';
import { useId, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';

export default function VersionMiddlewares() {
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const id = useId();

	return (
		<div id={id} className='pt-12 px-6 space-y-6 h-full flex flex-col overflow-auto'>
			<Middlewares parentId={id} setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
		</div>
	);
}
