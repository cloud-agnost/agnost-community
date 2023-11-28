import { MiddlewareSchema } from '@/types';
import { Button } from '@/components/Button';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
export default function MiddlewareForm({ loading }: { loading: boolean }) {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof MiddlewareSchema>>();
	return (
		<>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('version.middleware.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.name)}
								placeholder={
									t('forms.placeholder', {
										label: t('general.name'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<FormDescription>{t('forms.max64.description')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className='flex justify-end mt-4'>
				<Button loading={loading} size='lg' type='submit'>
					{t('general.save')}
				</Button>
			</div>
		</>
	);
}
