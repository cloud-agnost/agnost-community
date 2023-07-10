import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { MiddlewareActions, SettingsMiddleware } from '@/features/version/SettingsMiddleware';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';

export default function VersionSettingsMiddlewares() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();

	return (
		<SettingsContainer
			action={<MiddlewareActions selectedRows={selectedRows} />}
			pageTitle={t('version.settings.middlewares')}
			className='table-view'
		>
			<SettingsMiddleware setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
		</SettingsContainer>
	);
}
