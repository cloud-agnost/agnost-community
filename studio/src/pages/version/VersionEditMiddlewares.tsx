import { useEffect, useMemo, useState } from 'react';
import { Middleware } from '@/types';
import { useParams } from 'react-router-dom';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { VersionEditorLayout } from '@/layouts/VersionLayout';

export default function VersionEditMiddlewares() {
	const { middlewareId, orgId, appId, versionId } = useParams() as Record<string, string>;
	const { saveMiddlewareCode, setEditMiddlewareDrawerIsOpen, middlewares } = useMiddlewareStore();
	const [loading, setLoading] = useState(false);
	const getMiddlewareById = useMiddlewareStore((state) => state.getMiddlewareById);
	const [middleware, setMiddleware] = useState<Middleware>();

	const name = useMemo(() => {
		return middlewares.find((mw) => mw._id === middlewareId)?.name;
	}, [middlewares, middlewareId]);

	useEffect(() => {
		init();
	}, []);

	async function init() {
		const res = await getMiddlewareById({
			orgId,
			appId,
			versionId,
			mwId: middlewareId,
		});
		setMiddleware(res);
	}

	async function saveLogic() {
		if (!middleware?.logic) return;
		try {
			setLoading(true);
			await saveMiddlewareCode({
				orgId,
				appId,
				versionId,
				mwId: middlewareId,
				logic: middleware?.logic,
			});
		} finally {
			setLoading(false);
		}
	}
	function openEditDrawer() {
		setEditMiddlewareDrawerIsOpen(true);
		setMiddleware(middleware);
	}

	function setLogic(logic?: string) {
		if (!logic) return;
		setMiddleware((prev) => {
			if (!prev) return prev;
			return { ...prev, logic };
		});
	}

	return (
		<VersionEditorLayout
			onEditModalOpen={openEditDrawer}
			onSaveLogic={saveLogic}
			loading={loading}
			logic={middleware?.logic}
			setLogic={setLogic}
		>
			<span className='text-default text-xl'>{name}</span>
		</VersionEditorLayout>
	);
}
