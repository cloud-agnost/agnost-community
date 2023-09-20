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
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { VersionTable } from '../version/Table';
import { useMatch } from 'react-router-dom';

export default function ApplicationVersions() {
	const { t } = useTranslation();
	const { isVersionOpen, application, closeVersionDrawer } = useApplicationStore();
	const { getAllVersionsVisibleToUser, versions, versionPage, setVersionPage } = useVersionStore();

	const [name, setName] = useState('');
	const prevQueryRef = useRef(name);
	const prevPageRef = useRef(versionPage);

	const match = useMatch('/organization/:orgId/apps');

	const getVersions = useCallback(() => {
		if (application?._id || (name && prevPageRef.current !== versionPage)) {
			getAllVersionsVisibleToUser({
				appId: application?._id as string,
				page: versionPage,
				size: 10,
				...(name && { name }),
			});
			prevQueryRef.current = name;
			prevPageRef.current = versionPage;
		}
	}, [versionPage, name, application?._id]);

	function handleSearch(val: string) {
		setName(val);
		setVersionPage(0);
	}

	useUpdateEffect(() => {
		if (isVersionOpen) {
			getVersions();
		}
	}, [getVersions, isVersionOpen]);

	return (
		<Drawer open={isVersionOpen} onOpenChange={() => closeVersionDrawer(!!match)}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('application.version.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='scroll' id='infinite-scroll'>
					<div className='space-y-6 p-6'>
						<SearchInput
							placeholder={t('application.version.search') as string}
							onSearch={handleSearch}
						/>
						<InfiniteScroll
							scrollableTarget='infinite-scroll'
							dataLength={versions.length}
							next={() => setVersionPage(versionPage + 1)}
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
