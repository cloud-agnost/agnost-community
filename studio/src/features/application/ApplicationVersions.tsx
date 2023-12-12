import { Button } from '@/components/Button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import { SearchInput } from '@/components/SearchInput';
import { useUpdateEffect } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMatch, useSearchParams } from 'react-router-dom';
import { VersionTable } from '../version/Table';
export default function ApplicationVersions() {
	const { t } = useTranslation();
	const { isVersionOpen, application, closeVersionDrawer } = useApplicationStore();
	const { getAllVersionsVisibleToUser, versions, selectVersion } = useVersionStore();
	const [page, setPage] = useState(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const match = useMatch('/organization/:orgId/apps');
	const getVersions = useCallback(async () => {
		if (application?._id) {
			const versions = await getAllVersionsVisibleToUser({
				orgId: application?.orgId as string,
				appId: application?._id as string,
				page,
				size: 10,
				name: searchParams.get('q') || '',
			});

			if (versions.length === 1) {
				selectVersion(versions[0]);
			}
		}
	}, [page, searchParams, application?._id]);

	function closeDrawerHandler() {
		searchParams.delete('q');
		setSearchParams(searchParams);
		closeVersionDrawer(!!match);
	}
	useUpdateEffect(() => {
		if (isVersionOpen) {
			getVersions();
		}
	}, [getVersions, isVersionOpen]);

	return (
		<Drawer open={isVersionOpen} onOpenChange={closeDrawerHandler}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('application.version.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='scroll' id='infinite-scroll'>
					<div className='space-y-6 p-6'>
						<SearchInput placeholder={t('application.version.search') as string} />
						<InfiniteScroll
							scrollableTarget='infinite-scroll'
							dataLength={versions.length}
							next={() => setPage((prev) => prev + 1)}
							hasMore={true}
							loader={<></>}
						>
							<VersionTable />
						</InfiniteScroll>
						<DrawerFooter>
							<DrawerClose asChild>
								<Button variant='secondary' size='lg'>
									{t('general.cancel')}
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
