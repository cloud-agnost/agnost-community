import { Button } from '@/components/Button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/Dialog';
import { Form } from '@/components/Form';
import { Pencil } from '@/components/icons';
import { AccessDbSchema, ConnectDatabaseSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceItem from '../../../CreateResourceItem';
import DatabaseInfo from './DatabaseInfo';

export default function ReadReplicas() {
	const { t } = useTranslation();
	const [openModal, setOpenModal] = useState(false);
	const { setValue, getValues, reset } = useFormContext<z.infer<typeof ConnectDatabaseSchema>>();
	const readReplicas = getValues('accessReadOnly') ?? [];
	const replicasForm = useForm<z.infer<typeof AccessDbSchema>>({
		resolver: zodResolver(AccessDbSchema),
	});

	function addNewReplica(data: any) {
		setValue('accessReadOnly', [...readReplicas, data]);
		setOpenModal(false);
		replicasForm.reset();
	}

	function onSubmit() {
		// e.preventDefault();
		// e.stopPropagation;
		replicasForm.handleSubmit(addNewReplica)();
	}

	function removeReplica(index: number) {
		const filteredReplicas = readReplicas.filter((_, i) => i !== index);
		reset({ accessReadOnly: filteredReplicas });
	}
	function editReplica(index: number) {
		const replica = readReplicas[index];
		replicasForm.reset({
			host: replica.host,
			port: replica.port,
			username: replica.username,
			password: replica.password,
			dbName: replica.dbName,
		});
		setOpenModal(true);
	}
	return (
		<CreateResourceItem title={t('resources.database.add_replica')}>
			<div className='space-y-3'>
				{getValues('accessReadOnly')?.map((replica, index) => (
					<div
						key={replica.host + replica.port}
						className='bg-wrapper-background-light p-3 flex items-center justify-between gap-6'
					>
						<div>
							<span className='text-default font-sfCompact text-sm'>
								{replica.host} : {replica.port}
							</span>
						</div>
						<div className=''>
							<Button variant='blank' iconOnly type='button'>
								<Pencil className='w-5 h-5 text-icon-base' onClick={() => editReplica(index)} />
							</Button>
							<Button variant='blank' iconOnly type='button' onClick={() => removeReplica(index)}>
								<Trash size={20} className='text-icon-base' />
							</Button>
						</div>
					</div>
				))}
			</div>
			<Dialog open={openModal} onOpenChange={setOpenModal}>
				<DialogTrigger asChild>
					<Button type='button' variant='blank'>
						<Plus size={16} className='text-icon-secondary' />
						<span className='ml-2'>{t('resources.database.add_replica')}</span>
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('resources.database.add_replica')}</DialogTitle>
					</DialogHeader>
					<Form {...replicasForm}>
						<form className='space-y-4'>
							<DatabaseInfo
								control={replicasForm.control}
								errors={replicasForm.formState.errors}
								modal
							/>

							<DialogFooter>
								<div className='flex justify-end mt-8'>
									<DialogClose asChild>
										<Button variant='secondary'>{t('general.cancel')}</Button>
									</DialogClose>
									<Button type='button' className='ml-2' onClick={onSubmit}>
										{t('resources.database.add_replica')}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</CreateResourceItem>
	);
}
