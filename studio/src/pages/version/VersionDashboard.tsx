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
import useEnvironmentStore from '@/store/environment/environmentStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { capitalize } from '@/utils';
import { Key } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link, LoaderFunctionArgs } from 'react-router-dom';
VersionDashboard.loader = async ({ params }: LoaderFunctionArgs) => {
	const { getVersionDashboardInfo } = useVersionStore.getState();
	getVersionDashboardInfo({
		orgId: params.orgId as string,
		appId: params.appId as string,
		versionId: params.versionId as string,
	});
	return { props: {} };
};
export default function VersionDashboard() {
	const { version, dashboard } = useVersionStore();
	const { environment } = useEnvironmentStore();
	const { addSettingsTab } = useTabStore();
	const { t } = useTranslation();
	function getIcon(type: string) {
		const Icon = TAB_ICON_MAP[type];
		return <Icon className='w-8 h-8 text-default' />;
	}

	const GUIDES = [
		{
			title: 'Product Guides',
			description: 'Learn how to use our product',
			link: '/_blank',
		},
		{
			title: 'Client API Guide',
			description: 'Learn how to use our Client API',
			link: '/_blank',
		},
		{
			title: 'API Reference',
			description: 'Learn how to use our API',
			link: '/_blank',
		},
	];
	return (
		<div className='space-y-8 max-w-7xl'>
			<h1 className='text-default text-2xl'>{t('version.dashboard')}</h1>
			<div className='grid grid-cols-4 gap-4 mt-10 '>
				{Object.entries(dashboard).map(([key, value]) => (
					<div
						key={key}
						className='bg-wrapper-background-base hover:bg-wrapper-background-hover p-6 rounded-md'
					>
						<div className='flex items-center gap-4'>
							<div className='p-3 rounded-lg bg-lighter'>{getIcon(capitalize(key))}</div>
							<div className=''>
								<h1 className='text-default text-2xl'>{value}</h1>
								<h2 className='text-subtle'>
									{capitalize(key)}
									{value > 1 ? 's' : ''}
								</h2>
							</div>
						</div>
					</div>
				))}
			</div>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{t('version.settings.version_id')}</CardTitle>
					<CardDescription>{t('version.settings.version_id_desc')}</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='flex items-center gap-4 max-w-lg'>
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
					{version.apiKeys.map((key) => (
						<div key={key._id} className='flex items-center gap-4 max-w-xl'>
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
					<CardTitle>{t('version.resources')}</CardTitle>
				</CardHeader>
				<CardContent className='grid grid-cols-3 gap-6'>
					{GUIDES.map((guide) => (
						<Link
							to={guide.link}
							key={guide.title}
							className='border border-border'
							target='_blank'
							rel='noopener noreferrer'
						>
							<div className='flex items-center gap-4 max-w-xl p-4'>
								<div className='p-4 bg-lighter '>
									<Key className='w-6 h-6 text-default' />
								</div>
								<div className='flex-1'>
									<h1 className='text-default text-lg'>{guide.title}</h1>
									<h2 className='text-subtle text-md'>{guide.description}</h2>
								</div>
							</div>
						</Link>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
