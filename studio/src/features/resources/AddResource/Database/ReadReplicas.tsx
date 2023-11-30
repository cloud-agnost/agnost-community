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
import { INSTANCE_PORT_MAP } from '@/constants';
import { DatabaseInfo, MongoConnectionFormat, TestConnectionButton } from '@/features/resources';
import { AccessDbSchema, ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

export default function ReadReplicas() {
	const { t } = useTranslation();
	const { setValue, getValues, reset, watch } =
		useFormContext<z.infer<typeof ConnectResourceSchema>>();
	const readReplicas = getValues('accessReadOnly') ?? [];
	const replicasForm = useForm<z.infer<typeof AccessDbSchema>>({
		resolver: zodResolver(AccessDbSchema),
	});

	function addNewReplica(data: any) {
		setValue('accessReadOnly', [...readReplicas, data]);
		replicasForm.reset();
	}

	function onSubmit() {
		replicasForm.handleSubmit(addNewReplica)();
	}

	function removeReplica(index: number) {
		const filteredReplicas = readReplicas.filter((_, i) => i !== index);
		reset({ ...getValues(), accessReadOnly: filteredReplicas });
	}
	function editReplica(index: number) {
		const replica = readReplicas[index];
		replicasForm.reset({
			host: replica.host,
			port: replica.port,
			username: replica.username,
			password: replica.password,
		});
	}

	function onClose() {
		replicasForm.reset();
	}
	useEffect(() => {
		if (watch('instance')) {
			replicasForm.setValue('port', INSTANCE_PORT_MAP[watch('instance')]);
		}
	}, [watch('instance')]);
	return (
		<div>
			<h6 className=' font-sfCompact text-sm text-subtle '>
				{t('resources.database.read_replicas')}
			</h6>
			<div className='space-y-3'>
				{getValues('accessReadOnly')?.map((replica, index) => (
					<div
						key={index}
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
			<Dialog onOpenChange={onClose}>
				<DialogTrigger asChild>
					<Button type='button' variant='text'>
						<Plus size={16} className='text-brand-primary' />
						<span className='ml-2 text-brand-primary'>{t('resources.database.add_replica')}</span>
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('resources.database.add_replica')}</DialogTitle>
					</DialogHeader>
					<Form {...replicasForm}>
						<form className='space-y-4'>
							{watch('instance') === 'MongoDB' && <MongoConnectionFormat />}
							<DatabaseInfo modal />

							<DialogFooter>
								<div className='flex justify-end gap-4 mt-8'>
									<TestConnectionButton replica />
									<DialogClose asChild>
										<Button size='lg' variant='secondary'>
											{t('general.cancel')}
										</Button>
									</DialogClose>
									<Button size='lg' type='button' onClick={onSubmit}>
										{t('resources.database.add_replica')}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
