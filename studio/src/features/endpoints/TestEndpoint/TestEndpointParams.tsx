import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { TableCell, TableRow } from '@/components/Table';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { getPathParams } from '@/utils';
import { Plus, Trash } from '@phosphor-icons/react';
import { FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { TestEndpointSchema } from '../TestEndpoint';
import TestEndpointTable from './TestEndpointTable';
export default function TestEndpointParams() {
	const { t } = useTranslation();
	const {
		control,
		formState: { errors },
	} = useFormContext<z.infer<typeof TestEndpointSchema>>();

	const { endpoint } = useEndpointStore();

	const {
		fields: queryParamsFields,
		append: appendQueryParams,
		remove: removeQueryParamFields,
	} = useFieldArray({
		control,
		name: 'params.queryParams',
	});
	const { fields: pathParamFields, append: appendPathParams } = useFieldArray({
		control,
		name: 'params.pathVariables',
	});

	useEffect(() => {
		if (endpoint?.path) {
			const pathParams = getPathParams(endpoint?.path);
			if (pathParams.length > pathParamFields.length)
				pathParams.forEach((p) => {
					appendPathParams({ key: p, value: '' });
				});
		}
	}, [endpoint?.path]);

	return (
		<>
			<TestEndpointTable>
				{queryParamsFields.map((f, index) => (
					<TableRow key={f.id}>
						<TableCell>
							<FormField
								control={control}
								name={`params.queryParams.${index}.key`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											<Input
												placeholder={
													t('forms.placeholder', {
														label: t('resources.database.key'),
													}) ?? ''
												}
												error={!!errors.params?.queryParams?.[index]?.key}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						<TableCell>
							<FormField
								control={control}
								name={`params.queryParams.${index}.value`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											<Input
												placeholder={
													t('forms.placeholder', {
														label: t('resources.database.key'),
													}) ?? ''
												}
												error={!!errors.params?.queryParams?.[index]?.value}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						<TableCell>
							<Button
								type='button'
								variant='secondary'
								onClick={() => removeQueryParamFields(index)}
							>
								<Trash size={16} className='text-icon-secondary' />
							</Button>
						</TableCell>
					</TableRow>
				))}
				<TableRow>
					<TableCell colSpan={3} className='text-center'>
						<Button
							type='button'
							variant='secondary'
							onClick={() => appendQueryParams({ key: '', value: '' })}
						>
							<Plus size={16} className='text-icon-secondary mr-2' weight='bold' />
							{t('endpoint.test.add_query_param')}
						</Button>
					</TableCell>
				</TableRow>
			</TestEndpointTable>
			{pathParamFields.length > 0 && (
				<TestEndpointTable>
					{pathParamFields.map((f, index) => (
						<TableRow key={f.id}>
							<TableCell>
								<FormField
									control={control}
									name={`params.pathVariables.${index}.key`}
									render={({ field }) => (
										<FormItem className='flex-1'>
											<FormControl>
												<Input
													placeholder={
														t('forms.placeholder', {
															label: t('resources.database.key'),
														}) ?? ''
													}
													error={!!errors.params?.queryParams?.[index]?.key}
													disabled
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TableCell>
							<TableCell>
								<FormField
									control={control}
									name={`params.pathVariables.${index}.value`}
									render={({ field }) => (
										<FormItem className='flex-1'>
											<FormControl>
												<Input
													placeholder={
														t('forms.placeholder', {
															label: t('resources.database.key'),
														}) ?? ''
													}
													error={!!errors.params?.queryParams?.[index]?.value}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TableCell>
						</TableRow>
					))}
				</TestEndpointTable>
			)}
		</>
	);
}
