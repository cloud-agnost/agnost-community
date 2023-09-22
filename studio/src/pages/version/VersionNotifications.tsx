import { AutoComplete } from '@/components/AutoComplete';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateText } from '@/components/DateText';
import { TableLoading } from '@/components/Table/Table';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore';
import { ApplicationMember, FormatOptionLabelProps, NotificationActions } from '@/types';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { Range } from 'react-date-range';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import { NOTIFICATION_ACTIONS } from '@/constants';
import { capitalize } from '@/utils';

interface MemberSearch {
	label: string;
	value: ApplicationMember;
}

const filterMembers = (inputValue: string) => {
	const { tempTeam: members } = useApplicationStore.getState();

	const memberOptions = members.map((res) => ({
		label: res.member.name,
		value: res,
	}));
	return memberOptions.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
};

const promiseOptions = (inputValue: string) =>
	new Promise<
		{
			label: string;
			value: ApplicationMember;
		}[]
	>((resolve) => {
		setTimeout(() => {
			resolve(filterMembers(inputValue));
		}, 1000);
	});

const formatOptionLabel = ({ label, value }: FormatOptionLabelProps) => {
	const name = label?.split(' ');
	return (
		<div className='gap-2'>
			{value?.member.pictureUrl ? (
				<img
					src={value?.member.pictureUrl}
					alt={label}
					className='rounded-full object-contain w-6 h-6'
				/>
			) : (
				name && (
					<div
						className='relative inline-flex items-center justify-center cursor-pointer overflow-hidden w-6 h-6 rounded-full'
						style={{
							backgroundColor: value?.member.color,
						}}
					>
						<span className='text-default text-xs'>
							{name[0]?.charAt(0).toUpperCase()}
							{name[1]?.charAt(0).toUpperCase()}
						</span>
					</div>
				)
			)}
			<span className='ml-2 text-default text-xs'>{label}</span>
		</div>
	);
};
export default function VersionNotifications() {
	const { t } = useTranslation();
	const { getAppTeamMembers } = useApplicationStore();
	const { notifications, getVersionNotifications, notificationLastFetchedCount } =
		useVersionStore();
	const [searchParams, setSearchParams] = useSearchParams();

	const [date, setDate] = useState<Range[]>([
		{
			startDate: new Date(),
			endDate: DateTime.now().plus({ days: 1 }).toJSDate(),
			key: 'selection',
		},
	]);
	const [page, setPage] = useState(0);
	const { orgId, versionId, appId } = useParams() as {
		orgId: string;
		versionId: string;
		appId: string;
	};
	function handleQueryParamChange(paramName: string, paramValue: string) {
		if (!paramValue) {
			searchParams.delete(paramName);
			setSearchParams(searchParams);
		} else {
			const currentParamValue = searchParams.get(paramName);
			const currentParamArray = currentParamValue?.split(',') ?? [];
			if (currentParamArray?.includes(paramValue)) {
				const updatedValues = currentParamArray?.filter((value) => value !== paramValue);
				searchParams.set(paramName, updatedValues.join(','));
			} else {
				currentParamArray?.push(paramValue);
				searchParams.set(paramName, currentParamArray?.join(',') as string);
			}
		}

		setSearchParams(searchParams);
	}
	useEffect(() => {
		getVersionNotifications({
			appId,
			orgId,
			versionId,
			page,
			size: 50,
			sortBy: 'createdAt',
			sortDir: 'desc',
			actor: searchParams.get('u')?.split(',') ?? undefined,
			start: searchParams.get('start') ?? undefined,
			end: searchParams.get('end') ?? undefined,
			action: (searchParams.get('a')?.split(',') as NotificationActions[]) ?? undefined,
			initialFetch: page === 0,
		});
	}, [page, searchParams]);

	useEffect(() => {
		getAppTeamMembers();
	}, []);

	function resetMemberFilter() {
		searchParams.delete('u');
		setSearchParams(searchParams);
		setPage(0);
	}

	function resetDateFilter() {
		searchParams.delete('start');
		searchParams.delete('end');
		setSearchParams(searchParams);
		setDate([
			{
				startDate: new Date(),
				endDate: DateTime.now().plus({ days: 1 }).toJSDate(),
				key: 'selection',
			},
		]);
		setPage(0);
	}

	function resetActionFilter() {
		searchParams.delete('a');
		setSearchParams(searchParams);
		setPage(0);
	}

	function clearAllFilters() {
		resetDateFilter();
		resetMemberFilter();
		resetActionFilter();
	}
	return (
		<div className='flex gap-6 h-full'>
			<div className='p-6 bg-subtle rounded-lg space-y-6'>
				<div className='flex items-center justify-between'>
					<h1 className='text-default text-xl'>Filter</h1>
					<Button variant='blank' className='link' onClick={clearAllFilters}>
						Reset All
					</Button>
				</div>
				<div className='space-y-3'>
					<h5 className='text-default text-sm font-sfCompact'>Team Member</h5>
					<AutoComplete<MemberSearch[]>
						isMulti
						loadOptions={promiseOptions}
						formatOptionLabel={formatOptionLabel}
						onChange={(value: MemberSearch[]) => {
							setPage(0);
							handleQueryParamChange('u', value.map((v) => v.value.member._id).join(','));
						}}
						placeholder='Search team member'
					/>
				</div>

				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<h5 className='text-default text-sm font-sfCompact'>Activity Type</h5>
						<Button variant='blank' className='link' onClick={resetActionFilter}>
							Clear
						</Button>
					</div>

					{NOTIFICATION_ACTIONS.map((action) => (
						<Checkbox
							key={action}
							label={capitalize(action)}
							value={action}
							checked={searchParams.get('a')?.split(',').includes(action)}
							onCheckedChange={(checked) => handleQueryParamChange('a', checked ? action : '')}
						/>
					))}
				</div>
				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<h5 className='text-default text-sm font-sfCompact'>Date Time & Range</h5>
						<Button variant='blank' className='link' onClick={resetDateFilter}>
							Clear
						</Button>
					</div>
					<DateRangePicker
						date={date}
						onChange={(date) => {
							setDate(date);
							setPage(0);
							setSearchParams({
								...searchParams,
								start: date[0].startDate?.toISOString(),
								end: date[0].endDate?.toISOString(),
							});
						}}
					/>
				</div>
			</div>
			<div className='border border-border rounded-lg flex-1'>
				<div className='bg-subtle p-6 border-b border-border'>
					<h1 className='text-default text-xl'>{t('version.notifications')}</h1>
				</div>
				<div className='scroll p-6 divide-y-2' id='scrollableDiv'>
					<InfiniteScroll
						scrollableTarget='scrollableDiv'
						dataLength={notifications.length}
						next={() => {
							setPage(page + 1);
						}}
						hasMore={notificationLastFetchedCount === 50}
						loader={notifications.length > 0 && <TableLoading />}
					>
						{notifications.map((notification) => (
							<div className='flex items-center justify-between p-5' key={notification._id}>
								<div className='flex items-center gap-4'>
									<Avatar size='sm'>
										<AvatarImage src={notification.actor.pictureUrl as string} />
										<AvatarFallback
											color={notification.actor.color as string}
											name={notification.actor.name}
											className='text-sm'
										/>
									</Avatar>
									<div>
										<p className='text-sm text-default font-sfCompact'>{notification.actor.name}</p>
										<p className='text-xs text-subtle font-sfCompact'>
											{notification.actor.contactEmail}
										</p>
									</div>
								</div>
								<p className='text-sm text-default font-sfCompact flex-[0.8]'>
									{notification.description}
								</p>
								<DateText date={notification.createdAt} />
							</div>
						))}
					</InfiniteScroll>
				</div>
			</div>
		</div>
	);
}
