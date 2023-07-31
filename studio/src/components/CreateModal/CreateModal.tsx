import { Button } from '@/components/Button';
import { Form } from '@/components/Form';
import { Modal, ModalProps } from '@/components/Modal';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

interface CreateModalProps extends ModalProps {
	form: any;
	schema: any;
	title: string | null;
	children: React.ReactNode;
	loading?: boolean;
	onSubmitAction: (data: CreateModalProps['schema']) => void;
}
export default function CreateModal({
	title,
	closeModal,
	form,
	schema,
	onSubmitAction,
	children,
	loading,
	...props
}: CreateModalProps) {
	const { t } = useTranslation();

	async function onSubmit(data: z.infer<typeof schema>) {
		onSubmitAction(data);
	}

	return (
		<Modal {...props} title={title} closeModal={closeModal}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='organization-form'>
					{children}
					<div className='flex justify-end gap-4 mt-2'>
						<Button variant='text' type='button' size='lg' onClick={closeModal}>
							{t('general.cancel')}
						</Button>
						<Button variant='primary' size='lg' loading={loading}>
							{t('general.ok')}
						</Button>
					</div>
				</form>
			</Form>
		</Modal>
	);
}
