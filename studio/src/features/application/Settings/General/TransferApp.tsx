import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import { APIError, ApplicationMember, FormatOptionLabelProps } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

const formatOptionLabel = ({ label, value }: FormatOptionLabelProps) => {
	const name = label?.split(' ');
	return (
		<div className='flex items-center gap-1'>
			{value.member.pictureUrl ? (
				<img
					src={value.member.pictureUrl}
					alt={label}
					className='rounded-full object-contain w-8 h-8 '
				/>
			) : (
				name && (
					<div
						className='relative inline-flex items-center justify-center cursor-pointer overflow-hidden w-7 h-7 rounded-full'
						style={{
							backgroundColor: value.member.color,
						}}
					>
						<span className='text-default text-xs'>
							{name[0]?.charAt(0).toUpperCase()}
							{name[1]?.charAt(0).toUpperCase()}
						</span>
					</div>
				)
			)}
			<div className='flex flex-col'>
				<span className='ml-2 text-default text-sm font-sfCompact'>{label}</span>
				<span className='ml-2 text-xs text-subtle font-sfCompact -mt-1'>
					{value.member.contactEmail}
				</span>
			</div>
		</div>
	);
};
export default function TransferApp() {
	const { t } = useTranslation();
	const { teamOptions, transferAppOwnership } = useApplicationStore();
	const [user, setUser] = useState<ApplicationMember>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	function transferApp() {
		setLoading(true);
		transferAppOwnership({
			userId: user?.member._id as string,
			onSuccess: () => {
				setUser(undefined);
				setLoading(false);
				notify({
					title: t('application.edit.transfer.success'),
					description: t('application.edit.transfer.successDesc'),
					type: 'success',
				});
			},
			onError: (error) => {
				setLoading(false);
				setError(error);
			},
		});
	}
	return (
		<div className='space-y-3'>
			<Description title={t('application.edit.transfer.title')}>
				{t('application.edit.transfer.description')}
				<span className='block mt-3'>{t('application.edit.transfer.subDesc')}</span>
			</Description>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error?.error}</AlertTitle>
					<AlertDescription>{error?.details}</AlertDescription>
				</Alert>
			)}
			<Select
				isLoading={loading}
				isClearable
				isSearchable
				name='color'
				options={teamOptions}
				className='select-container'
				classNamePrefix='select'
				formatOptionLabel={formatOptionLabel}
				placeholder={t('application.edit.transfer.placeholder')}
				onChange={(value) => {
					setUser(value?.value);
				}}
			></Select>
			<Button size='lg' variant='primary' onClick={transferApp}>
				{t('general.transfer')}
			</Button>
		</div>
	);
}
