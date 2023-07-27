import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { TableCell, TableRow } from '@/components/Table';
import { capitalize } from '@/utils';
import { Plus, Trash } from '@phosphor-icons/react';
import { FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { TestEndpointSchema } from '../TestEndpoint';
import TestEndpointTable from './TestEndpointTable';

export default function EndpointFiles() {
	const { control, setValue } = useFormContext<z.infer<typeof TestEndpointSchema>>();
	const [type, setType] = useState('text');
	const { t } = useTranslation();

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'formData',
	});

	function selectFile(index: number) {
		const input = document.createElement('input');
		input.type = 'file';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				setValue(`formData.${index}.file`, file);
			}
		};
		input.click();
	}

	return (
		<TestEndpointTable title={t('endpoint.test.path_variables') ?? ''} isFormData>
			{fields.map((f, index) => (
				<TableRow key={f.id}>
					<TableCell>
						<Select onValueChange={setType}>
							<SelectTrigger defaultValue={type} className='w-[120px]'>
								<SelectValue>{capitalize(type)}</SelectValue>
							</SelectTrigger>

							<SelectContent>
								{['text', 'file']?.map((role) => (
									<SelectItem key={role} value={role}>
										{role}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</TableCell>
					<TableCell>
						<FormField
							control={control}
							name={`formData.${index}.key`}
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormControl>
										<Input
											placeholder={
												t('forms.placeholder', {
													label: t('resources.database.key'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</TableCell>
					<TableCell>
						{type === 'text' ? (
							<FormField
								control={control}
								name={`formData.${index}.value`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											<Input
												placeholder={
													t('forms.placeholder', {
														label: t('resources.database.key'),
													}) ?? ''
												}
												{...field}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						) : (
							<FormField
								control={control}
								name={`formData.${index}.file`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											{field.value ? (
												<Badge
													text={field.value.name}
													onClear={() => {
														field.onChange(undefined);
														remove(index);
													}}
												/>
											) : (
												<Button type='button' variant='primary' onClick={() => selectFile(index)}>
													{t('general.select')}
												</Button>
											)}
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</TableCell>
					<TableCell>
						<Button type='button' variant='secondary' onClick={() => remove(index)}>
							<Trash size={16} className='text-icon-secondary' />
						</Button>
					</TableCell>
				</TableRow>
			))}
			<TableRow>
				<TableCell colSpan={4} className='text-center'>
					<Button
						type='button'
						variant='secondary'
						onClick={() => append({ key: '', value: undefined })}
					>
						<Plus size={16} className='text-icon-secondary mr-2' weight='bold' />
						{t('endpoint.test.add_query_param')}
					</Button>
				</TableCell>
			</TableRow>
		</TestEndpointTable>
	);
}
