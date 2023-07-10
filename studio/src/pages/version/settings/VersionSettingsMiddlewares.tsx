import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { AddMiddlewareButton, SettingsMiddleware } from '@/features/version/SettingsMiddleware';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';
import { SelectedRowDropdown } from 'components/Table';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { LoaderFunctionArgs } from 'react-router-dom';

export default function VersionSettingsMiddlewares() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const { deleteMiddleware, deleteMultipleMiddlewares } = useMiddlewareStore();

	async function deleteHandler() {
		const rows = selectedRows?.map((row) => row.original);
		if (!rows || rows.length === 0) return;
		const { orgId, versionId, appId } = rows[0];

		if (rows.length === 1) {
			await deleteMiddleware({
				orgId,
				versionId,
				appId,
				mwId: rows[0]._id,
			});
		} else {
			await deleteMultipleMiddlewares({
				orgId,
				versionId,
				appId,
				middlewareIds: rows.map((row) => row._id),
			});
		}
	}

	function Actions() {
		return (
			<div className='flex gap-4'>
				{!!selectedRows?.length && (
					<SelectedRowDropdown onDelete={deleteHandler} selectedRowLength={selectedRows?.length} />
				)}
				<AddMiddlewareButton />
			</div>
		);
	}

	return (
		<SettingsContainer
			action={<Actions />}
			pageTitle={t('version.settings.middlewares')}
			className='version-settings-middlewares'
		>
			<SettingsMiddleware setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
		</SettingsContainer>
	);
}

VersionSettingsMiddlewares.loader = async ({ params }: LoaderFunctionArgs) => {
	const { orgId, appId, versionId } = params;
	if (!orgId || !appId || !versionId) return null;

	await useMiddlewareStore.getState().getMiddlewaresOfAppVersion(
		{
			orgId,
			appId,
			versionId,
			page: 0,
			size: 15,
		},
		true,
	);

	return {};
};
