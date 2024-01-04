import { Button } from '@/components/Button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/Card';
import { CopyInput } from '@/components/CopyInput';
import { TAB_ICON_MAP } from '@/constants';
import { useUpdateEffect } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { TabTypes } from '@/types';
import { capitalize, generateId } from '@/utils';
import { BookBookmark, Code, FileJs, Key } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';

export default function VersionDashboard() {
	const { version, dashboard, getVersionDashboardPath, getVersionDashboardInfo } =
		useVersionStore();
	const { environment } = useEnvironmentStore();
	const { addSettingsTab, addTab } = useTabStore();
	const { t } = useTranslation();

	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const { application } = useApplicationStore();
	const { isFetching, refetch } = useQuery({
		queryKey: ['getVersionDashboardInfo'],
		queryFn: getVersionDashboardInfoHandler,
		refetchOnWindowFocus: false,
		enabled: _.isEmpty(dashboard),
	});

	function getVersionDashboardInfoHandler() {
		return getVersionDashboardInfo({
			orgId,
			appId: (application?._id as string) ?? appId,
			versionId: version._id ?? versionId,
		});
	}

	useUpdateEffect(() => {
		refetch();
	}, [orgId, versionId, appId]);

	function getIcon(type: string) {
		const Icon = TAB_ICON_MAP[type];
		return <Icon className='w-8 h-8 text-default' />;
	}

	const GUIDES = [
		{
			title: t('version.product_guide'),
			description: t('version.product_guide_desc'),
			link: 'https://agnost.dev/docs/intro',
			icon: BookBookmark,
		},
		{
			title: t('version.client_api'),
			description: t('version.client_api_desc'),
			link: 'https://agnost.dev/client',
			icon: FileJs,
		},
		{
			title: t('version.server_api'),
			description: t('version.server_api_desc'),
			link: 'https://agnost.dev/server',
			icon: Code,
		},
	];

	function clickDashboardItem(type: string, title: string) {
		addTab(version._id, {
			id: generateId(),
			title: `${title}s`,
			path: getVersionDashboardPath(type.toLowerCase()),
			type: type as TabTypes,
			isDashboard: false,
			isActive: true,
		});
	}
	return isFetching ? (
		<div className='flex items-center justify-center h-full'>
			<BeatLoader color='#6884FD' size={24} margin={18} />
		</div>
	) : (
		<div className='space-y-8 max-w-7xl'>
			<h1 className='text-default text-2xl'>{t('version.dashboard.title')}</h1>
			<div className='grid grid-cols-4 gap-6 mt-10 '>
				{Object.entries(dashboard).map(([key, value]) => (
					<Button
						variant='blank'
						key={key}
						className='bg-wrapper-background-base p-6 rounded-md shadow-sm h-auto block text-left font-normal hover:bg-button-secondary'
						onClick={() => clickDashboardItem(capitalize(key), t(`version.dashboard.${key}`))}
					>
						<div className='flex items-center gap-4'>
							<div className='p-3 rounded-lg bg-lighter'>{getIcon(capitalize(key))}</div>
							<div>
								<h1 className='text-default text-2xl'>{value}</h1>
								<h2 className='text-subtle'>
									{t(`version.dashboard.${key}`)}
									{value > 1 ? 's' : ''}
								</h2>
							</div>
						</div>
					</Button>
				))}
			</div>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{t('version.settings.version_id')}</CardTitle>
					<CardDescription>{t('version.settings.version_id_desc')}</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='flex items-center gap-4 max-w-4xl'>
						<div className='flex items-center gap-2 '>
							<Key className='w-4 h-4 text-default' />
							<h1 className='text-sm'>{environment.name}</h1>
						</div>
						<CopyInput
							readOnly
							value={`${window.location.origin}/${environment.iid}`}
							className='flex-1'
						/>
					</div>
				</CardContent>
			</Card>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{t('version.settings.api_keys')}</CardTitle>
					<CardDescription>{t('version.settings.api_keys_desc')}</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{version.apiKeys?.map((key) => (
						<div key={key._id} className='flex items-center gap-4 max-w-4xl'>
							<div className='flex items-center gap-2 flex-[0.2]'>
								<Key className='w-4 h-4 text-default' />
								<h1 className='text-sm'>{key.name}</h1>
							</div>
							<CopyInput value={key.key} readOnly className='flex-[0.8]' />
						</div>
					))}
				</CardContent>
				<CardFooter className='flex justify-between'>
					<Button variant='outline' onClick={() => addSettingsTab(version._id, 'api-keys')}>
						{t('version.settings.manage_api_keys')}
					</Button>
				</CardFooter>
			</Card>

			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{t('version.documentation')}</CardTitle>
				</CardHeader>
				<CardContent className='grid grid-cols-3 gap-6'>
					{GUIDES.map((guide) => (
						<Link
							to={guide.link}
							key={guide.title}
							className='border border-border hover:bg-button-secondary'
							target='_blank'
							rel='noopener noreferrer'
						>
							<div className='flex items-center gap-4 max-w-xl p-4'>
								<div className='p-4 bg-lighter '>
									<guide.icon className='w-6 h-6 text-default' />
								</div>
								<div className='flex-1'>
									<h1 className='text-default'>{guide.title}</h1>
									<h2 className='text-subtle text-sm'>{guide.description}</h2>
								</div>
							</div>
						</Link>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
