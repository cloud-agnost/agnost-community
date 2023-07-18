import { Button } from 'components/Button';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Trash } from '@phosphor-icons/react';
import { ConfirmationModal } from 'components/ConfirmationModal';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { Database } from '@/types';

export default function DeleteDatabaseButton({ database }: { database: Database }) {
	const [open, setOpen] = useState(false);
	const { deleteDatabase } = useDatabaseStore();
	const { t } = useTranslation();

	async function deleteHandler() {
		await deleteDatabase({
			orgId: database.orgId,
			appId: database.appId,
			dbId: database._id,
			versionId: database.versionId,
		});
		setOpen(false);
	}

	return (
		<>
			<ConfirmationModal
				alertTitle={t('database.delete.confirm_title')}
				alertDescription={t('database.delete.confirm_description')}
				title={t('database.delete.title')}
				confirmCode={database.name}
				description={
					<Trans
						i18nKey='database.delete.confirm'
						values={{ confirmCode: database.name }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				onConfirm={deleteHandler}
				isOpen={open}
				closeModal={() => setOpen(false)}
			/>
			<Button
				onClick={() => setOpen(true)}
				variant='blank'
				rounded
				className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
				iconOnly
			>
				<Trash size={20} />
			</Button>
		</>
	);
}
