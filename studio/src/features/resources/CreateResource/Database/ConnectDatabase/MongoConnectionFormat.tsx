import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { MONGODB_CONNECTION_FORMATS } from '@/constants';
import CreateResourceItem from '@/features/resources/CreateResourceItem';
import { ConnectDatabaseSchema } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

export default function MongoConnectionFormat() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof ConnectDatabaseSchema>>();
	return (
		<CreateResourceItem title={t('resources.database.selectConnFormat')}>
			<FormField
				control={form.control}
				name='access.connFormat'
				render={({ field }) => (
					<FormItem className='space-y-3'>
						<FormControl>
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className='flex items-center gap-6 mb-8'
							>
								{MONGODB_CONNECTION_FORMATS.map((type) => (
									<FormItem key={type} className='flex items-center space-x-3 space-y-0'>
										<FormControl>
											<RadioGroupItem value={type} />
										</FormControl>
										<FormLabel className='font-normal'>{t(`resources.database.${type}`)}</FormLabel>
									</FormItem>
								))}
							</RadioGroup>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</CreateResourceItem>
	);
}
