import { MiddlewareActions, Middlewares } from '@/features/version/Middlewares';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';

export default function VersionMiddlewares() {
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const { t } = useTranslation();

	return (
		<SettingsContainer
			action={<MiddlewareActions selectedRows={selectedRows} />}
			pageTitle={t('version.settings.middlewares')}
			className='table-view mt-6'
		>
			<Middlewares setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
		</SettingsContainer>
	);
}
