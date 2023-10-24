import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError, FormatOptionLabelProps } from '@/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

interface TransferOwnershipProps {
	transferOwnership: () => void;
	error: APIError;
	loading: boolean;
	userId: string;
	setUserId: (userId: string) => void;
}

const formatOptionLabel = ({ label, value }: FormatOptionLabelProps) => {
	const name = label?.split(' ');
	return (
		<div className='flex items-center gap-2'>
			{value.member.pictureUrl ? (
				<img
					src={value.member.pictureUrl}
					alt={label}
					className='rounded-full object-contain w-6 h-6'
				/>
			) : (
				name && (
					<div
						className='relative inline-flex items-center justify-center cursor-pointer overflow-hidden w-6 h-6 rounded-full'
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
				<span className='ml-2 text-default text-xs'>{label}</span>
				<span className='ml-2 text-[10px] text-subtle'>{value.member.contactEmail}</span>
			</div>
		</div>
	);
};

export default function TransferOwnership({
	transferOwnership,
	error,
	loading,
	setUserId,
	userId,
}: TransferOwnershipProps) {
	const canUpdate = useAuthorizeOrg('update');
	const { t } = useTranslation();
	const { members } = useOrganizationStore();
	const { user } = useAuthStore();
	const teamOptions = useMemo(() => {
		return members
			.filter((member) => member.member._id !== user?._id)
			.map((member) => ({
				label: member.member.name,
				value: member,
			}));
	}, [members]);
	return (
		<div className='space-y-8'>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error?.error}</AlertTitle>
					<AlertDescription>{error?.details}</AlertDescription>
				</Alert>
			)}
			<Select
				formatOptionLabel={formatOptionLabel}
				isLoading={loading}
				isClearable
				isSearchable
				name='color'
				options={teamOptions}
				className='select-container'
				classNamePrefix='select'
				placeholder={t('application.edit.transfer.placeholder')}
				onChange={(option) => {
					setUserId(option?.value.member._id as string);
				}}
			/>
			<Button
				size='lg'
				className='text-end'
				onClick={transferOwnership}
				loading={loading}
				disabled={!canUpdate || !userId}
			>
				{t('organization.transfer')}
			</Button>
		</div>
	);
}
