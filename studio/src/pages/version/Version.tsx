import { LoaderFunctionArgs, Outlet, useMatch } from 'react-router-dom';
import { VersionLayout } from '@/layouts/VersionLayout';
import useVersionStore from '@/store/version/versionStore.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useTranslation } from 'react-i18next';

const VERSION_TABS = [
	{
		label: 'Databases',
		component: <p>Databases</p>,
	},
	{
		label: 'Endpoints',
		component: <p>Endpoints</p>,
	},
	{
		label: 'Message Queues',
		component: <p>Message</p>,
	},
	{
		label: 'Corn Jobs',
		component: <p>Corn</p>,
	},
	{
		label: 'Storage',
		component: <p>Storage</p>,
	},
	{
		label: 'Settings',
		component: <p>Settings</p>,
	},
	{
		label: 'Activity',
		component: <p>Activity</p>,
	},
];

export default function Version() {
	const matched = useMatch('/organization/:orgId/apps/:appId/version/:versionId');
	const { t } = useTranslation();

	return (
		<VersionLayout>
			<div>
				<Tabs defaultValue={VERSION_TABS[0].label}>
					<TabsList title={matched ? t<string>('version.dashboard') : undefined} align='center'>
						{VERSION_TABS.map((tab) => (
							<TabsTrigger key={tab.label} value={tab.label}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{VERSION_TABS.map((tab) => (
						<TabsContent key={tab.label} value={tab.label}>
							{tab.component}
						</TabsContent>
					))}
				</Tabs>
			</div>
			<Outlet />
		</VersionLayout>
	);
}

Version.loader = async ({ params }: LoaderFunctionArgs) => {
	const { appId, orgId } = params;
	console.log(appId, orgId);
	if (!appId || !orgId) return null;
	await useVersionStore.getState().getAllVersionsVisibleToUser(orgId, appId);
	return null;
};
