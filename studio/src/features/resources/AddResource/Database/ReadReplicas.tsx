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
import { Pencil, TestConnection } from '@/components/icons';
import { AccessDbSchema, ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { DatabaseInfo, MongoConnectionFormat, TestConnectionButton } from '@/features/resources';
import useResourceStore from '@/store/resources/resourceStore';
import { useToast } from '@/hooks';
import { INSTANCE_PORT_MAP } from '@/constants';

export default function ReadReplicas() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { testExistingResourceConnection } = useResourceStore();
	const [openModal, setOpenModal] = useState(false);
	const { setValue, getValues, reset, watch } =
		useFormContext<z.infer<typeof ConnectResourceSchema>>();
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
		setOpenModal(true);
	}
	async function testResourceConnection() {
		testExistingResourceConnection({
			access: {
				...replicasForm.getValues(),
				options: replicasForm.getValues().options?.filter((option) => option.key && option.value),
				brokers: replicasForm.getValues().brokers?.map((broker) => broker.key) as string[],
			},
			type: getValues('type'),
			instance: getValues('instance'),
			allowedRoles: getValues('allowedRoles'),
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
