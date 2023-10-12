import { Form } from '@/components/Form';
import { SMTPForm } from '@/components/SMTPForm';
import { SMTPSchema } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
export default function ClusterSmtpForm() {
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof SMTPSchema>>({
		resolver: zodResolver(SMTPSchema),
	});
	return (
		<Form {...form}>
			<form className='space-y-6 flex flex-col max-w-2xl'>
				<p className='text-subtle text-sm font-sfCompact'>{t('cluster.smtpDescription')}</p>
				<SMTPForm />
				<Button type='submit' size='lg' className='self-end'>
					{t('general.save')}
				</Button>
			</form>
		</Form>
	);
}
