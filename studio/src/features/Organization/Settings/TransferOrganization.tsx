/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { AutoComplete } from '@/components/AutoComplete';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { FormatOptionLabelProps, GroupedOption, OrganizationMember } from '@/types';
import { APIError } from '@/types/type';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const loadOptions = async (inputValue: string) => {
	const res = await useOrganizationStore.getState().getOrganizationMembers({
		search: inputValue,
		excludeSelf: false,
		organizationId: useOrganizationStore.getState().organization?._id as string,
		page: 0,
		size: 50,
	});
	return res.map((res) => ({
		label: res.member.name,
		value: res,
	}));
};
const formatOptionLabel = ({ label, value }: FormatOptionLabelProps) => {
	const name = label?.split(' ');
	return (
		<div className='flex items-center gap-2'>
			{value.member.pictureUrl ? (
				<img
					src={value.member.pictureUrl}
					alt={label}
					className='rounded-full object-contain w-8 h-8 '
				/>
			) : (
				name && (
					<div
						className='relative inline-flex items-center justify-center cursor-pointer overflow-hidden w-8 h-8 rounded-full'
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
				<span className='ml-2 text-default text-sm'>{label}</span>
				<span className='ml-2 text-xs text-subtle'>{value.member.contactEmail}</span>
			</div>
		</div>
	);
};
const formatGroupLabel = (data: GroupedOption<OrganizationMember>) => {
	console.log('data', { data });
	return (
		<div className='flex items-center gap-2'>
			<span className='text-default text-sm'>{data.label}</span>
		</div>
	);
};
export default function TransferOrganization() {
	const [userId, setUserId] = useState<string>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { organization, transferOrganization } = useOrganizationStore();
	const { notify } = useToast();
	const navigate = useNavigate();
	function transferOrganizationHandle() {
		setLoading(true);
		transferOrganization({
			organizationId: organization?._id as string,
			userId: userId as string,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: 'Organization transferred successfully',
					description: 'You will be redirected to the new organization',
					type: 'success',
				});
				setTimeout(() => {
					navigate(`/organization`);
				}, 2000);
			},
			onError: (err) => {
				setError(err);
				setLoading(false);
			},
		});
	}
	return (
		<div className='space-y-8'>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error?.error}</AlertTitle>
					<AlertDescription>{error?.details}</AlertDescription>
				</Alert>
			)}
			<AutoComplete<OrganizationMember>
				loadOptions={loadOptions}
				onChange={(res) => setUserId(res.member._id)}
				formatOptionLabel={formatOptionLabel}
				formatGroupLabel={formatGroupLabel}
			/>
			<Button size='lg' className='text-end' onClick={transferOrganizationHandle} loading={loading}>
				Transfer
			</Button>
		</div>
	);
}
