import useAuthStore from '@/store/auth/authStore';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useFunctionStore from '@/store/function/functionStore';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useStorageStore from '@/store/storage/storageStore';
import useTaskStore from '@/store/task/taskStore';
import useTabStore from '@/store/version/tabStore';
import { getVersionPermission } from '@/utils';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';

async function editEndpointLoader({ params }: LoaderFunctionArgs) {
	const { endpointId, orgId, versionId, appId } = params;
	if (!endpointId) return null;
	const { updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { endpoint, getEndpointById, logics, setLogics } = useEndpointStore.getState();
	if (endpoint?._id === endpointId) {
		updateCurrentTab(versionId as string, {
			isDirty: logics[endpointId] ? endpoint.logic !== logics[endpointId] : false,
		});
		setLogics(endpointId, logics[endpointId] ?? endpoint.logic);
		closeDeleteTabModal();
		return { endpoint };
	}

	getEndpointById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		epId: endpointId,
	});

	return { props: { endpoint } };
}
async function editFunctionLoader({ params }: LoaderFunctionArgs) {
	const { funcId, orgId, versionId, appId } = params as Record<string, string>;
	if (!funcId) return null;
	const { getFunctionById, logics, setLogics } = useFunctionStore.getState();
	const { updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { function: helper } = useFunctionStore.getState();
	if (helper?._id === funcId) {
		updateCurrentTab(versionId as string, {
			isDirty: logics[funcId] ? helper.logic !== logics[funcId] : false,
		});
		setLogics(funcId, logics[funcId] ?? helper.logic);
		closeDeleteTabModal();
		return { helper };
	}

	await getFunctionById({
		orgId: orgId,
		appId: appId,
		versionId: versionId,
		funcId: funcId,
	});

	return { props: {} };
}
async function editMiddlewareLoader({ params }: LoaderFunctionArgs) {
	const { middlewareId, orgId, appId, versionId } = params as Record<string, string>;
	const { updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { middleware, logics, setLogics } = useMiddlewareStore.getState();
	if (middleware?._id === middlewareId) {
		updateCurrentTab(versionId as string, {
			isDirty: logics[middlewareId] ? middleware.logic !== logics[middlewareId] : false,
		});
		setLogics(middlewareId, logics[middlewareId] ?? middleware.logic);
		closeDeleteTabModal();
		return { middleware };
	}
	await useMiddlewareStore.getState().getMiddlewareById({
		orgId,
		appId,
		versionId,
		mwId: middlewareId,
	});
	return { props: {} };
}
async function editMessageQueueLoader({ params }: LoaderFunctionArgs) {
	const { queueId, orgId, versionId, appId } = params;
	if (!queueId) return null;
	const { updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { queue, setLogics, getQueueById, logics } = useMessageQueueStore.getState();
	if (queue?._id === queueId) {
		updateCurrentTab(versionId as string, {
			isDirty: logics[queueId] ? queue.logic !== logics[queueId] : false,
		});
		setLogics(queueId, logics[queueId] ?? queue.logic);
		closeDeleteTabModal();
		return { queue };
	}

	getQueueById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		queueId: queueId,
	});

	return { props: {} };
}

async function bucketLoader({ params }: LoaderFunctionArgs) {
	const { removeTab, getCurrentTab } = useTabStore.getState();
	const { storageId, appId, orgId, versionId } = params;
	const { storages } = useStorageStore.getState();
	let selectedStorage = storages.find((storage) => storage._id === storageId);
	if (!selectedStorage) {
		selectedStorage = await useStorageStore.getState().getStorageById({
			storageId: storageId as string,
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
		});
	}
	useStorageStore.setState({ storage: selectedStorage });

	const permission = getVersionPermission('storage.viewData');

	if (!permission) {
		removeTab(versionId as string, getCurrentTab(versionId as string).id);
		return redirect('/401');
	}

	return { props: {} };
}

async function fileLoader({ params }: LoaderFunctionArgs) {
	const { bucketName } = params;
	const { bucket, buckets, storage, getBucket } = useStorageStore.getState();

	if (bucketName !== bucket?.name) {
		let selectedBucket = buckets.find((bucket) => bucket.name === bucketName);
		if (!selectedBucket) {
			selectedBucket = await getBucket({
				storageName: storage?.name as string,
				bucketName: bucketName as string,
			});
		}
		useStorageStore.setState({ bucket: selectedBucket });
	}
	return { props: {} };
}
async function editTaskLoader({ params }: LoaderFunctionArgs) {
	const { taskId, orgId, versionId, appId } = params;
	if (!taskId) return null;
	const { updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { task, getTask, logics, setLogics } = useTaskStore.getState();
	if (task?._id === taskId) {
		updateCurrentTab(versionId as string, {
			isDirty: logics[taskId] ? task.logic !== logics[taskId] : false,
		});
		setLogics(taskId, logics[taskId] ?? task.logic);
		closeDeleteTabModal();
		return { task };
	}

	await getTask({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		taskId,
	});

	return { props: {} };
}

async function modelsOutletLoader({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;

	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};
	const { database, getDatabaseOfAppById } = useDatabaseStore.getState();
	if (database._id !== apiParams.dbId) getDatabaseOfAppById(apiParams);

	return { props: {} };
}

async function fieldsLoader({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;

	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};

	const { getSpecificModelOfDatabase, model } = useModelStore.getState();
	if (apiParams.modelId !== model?._id && apiParams.modelId)
		await getSpecificModelOfDatabase(apiParams);

	return { props: {} };
}

async function navigatorLoader({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;
	const { models } = useModelStore.getState();
	if (models.length > 0) return null;
	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};

	const { getModelsOfDatabase } = useModelStore.getState();
	await getModelsOfDatabase(apiParams);
	return null;
}

export default {
	editEndpointLoader,
	editFunctionLoader,
	editMiddlewareLoader,
	editMessageQueueLoader,
	bucketLoader,
	fileLoader,
	editTaskLoader,
	modelsOutletLoader,
	fieldsLoader,
	navigatorLoader,
};
