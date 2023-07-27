import { CodeEditor } from '@/components/CodeEditor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { TestEndpointSchema } from '../TestEndpoint';
import EndpointFiles from './EndpointFiles';
export default function EndpointBody() {
	const { control, watch } = useFormContext<z.infer<typeof TestEndpointSchema>>();
	const { t } = useTranslation();

	return (
		<>
			<FormField
				control={control}
				name='bodyType'
				render={({ field }) => (
					<FormItem className='flex-1 space-y-6'>
						<FormLabel>{t('endpoint.bodyType')}</FormLabel>
						<FormControl>
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className='flex items-center gap-x-6'
							>
								{['json', 'form-data'].map((item) => (
									<FormItem className='flex items-center space-x-3 space-y-0' key={item}>
										<FormControl>
											<RadioGroupItem value={item} />
										</FormControl>
										<FormLabel className='select-none cursor-pointer'>
											<p className='text-default'>{t(`endpoint.${item}`)}</p>
										</FormLabel>
									</FormItem>
								))}
							</RadioGroup>
						</FormControl>
					</FormItem>
				)}
			/>
			<div className='mt-6 h-full'>
				{watch('bodyType') === 'json' && (
					<FormField
						control={control}
						name='body'
						render={({ field }) => (
							<FormItem className='h-full'>
								<FormControl>
									<CodeEditor
										containerClassName='h-full'
										value={field.value}
										onChange={field.onChange}
										defaultLanguage='json'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{watch('bodyType') === 'form-data' && <EndpointFiles />}
			</div>
		</>
	);
}
