import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { AccessDbSchema, ConnectDatabaseSchema } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useTranslation } from 'react-i18next';
import CreateResourceItem from '../../../CreateResourceItem';
interface DatabaseInfoProps {
	modal: boolean;
	control?: any;
	errors?: any;
}

type DatabaseInfoType = typeof ConnectDatabaseSchema & typeof AccessDbSchema;

export default function DatabaseInfo({ control, errors, modal }: DatabaseInfoProps) {
	const { t } = useTranslation();

	return modal ? (
		<DatabaseInfoForm control={control} errors={errors} modal={modal} />
	) : (
		<CreateResourceItem title={t('resources.fill_parameters')}>
			<DatabaseInfoForm modal={modal} control={control} errors={errors} />
		</CreateResourceItem>
	);
}

function DatabaseInfoForm({ control, errors, modal }: DatabaseInfoProps) {
	const { t } = useTranslation();
	console.log('DatabaseInfo.tsx', modal ? 'host' : 'access.host');
	return (
		<div className='space-y-6'>
			<div className='flex gap-6'>
				<FormField
					control={control}
					name={modal ? 'host' : 'access.host'}
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.database.host')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(modal ? errors?.host : errors?.access?.host)}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.database.host'),
										}) ?? ''
									}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={modal ? 'port' : 'access.port'}
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.database.port')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(errors?.port)}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.database.port'),
										}) ?? ''
									}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={control}
				name={modal ? 'dbName' : 'access.dbName'}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('resources.database.database_name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(errors?.dbName)}
								placeholder={
									t('forms.placeholder', {
										label: t('resources.database.database_name'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>

						<FormMessage />
					</FormItem>
				)}
			/>
			<div className='flex items-start gap-6'>
				<FormField
					control={control}
					name={modal ? 'username' : 'access.username'}
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.database.username')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(errors?.username)}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.database.username'),
										}) ?? ''
									}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={modal ? 'password' : 'access.password'}
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.database.password')}</FormLabel>
							<FormControl>
								<PasswordInput
									error={Boolean(errors?.password)}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.database.password'),
										}) ?? ''
									}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
