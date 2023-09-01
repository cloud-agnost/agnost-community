import { NewTabDropdown, TabItem, TabOptionsDropdown } from '@/features/version/Tabs/index.ts';
import useTabStore from '@/store/version/tabStore.ts';
import { Tab } from '@/types';
import { generateId } from '@/utils';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Dashboard } from 'components/icons';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useMatches, useNavigate, useParams } from 'react-router-dom';
import './tabs.scss';

const SCROLL_AMOUNT = 200;

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [endOfScroll, setEndOfScroll] = useState(false);
	const [startOfScroll, setStartOfScroll] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const { getTabsByVersionId, removeTab, getPreviousTab, setCurrentTab, addTab } = useTabStore();

	const { t } = useTranslation();
	const matches = useMatches();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const { versionId } = useParams() as { versionId: string };

	const tabs = getTabsByVersionId(versionId);

	useEffect(() => {
		if (!scrollContainer.current) return;
		scrollContainer.current.querySelector('[data-active]')?.scrollIntoView({ behavior: 'smooth' });
	}, [tabs]);

	useEffect(() => {
		if (getTabsByVersionId(versionId).find((tab) => tab.isDashboard)) return;
		console.log('add');
		addTab(versionId, {
			id: generateId(),
			title: t('version.dashboard'),
			path: getDashboardPath(),
			isDashboard: true,
			isActive: false,
		});
	}, [versionId]);

	useEffect(() => {
		const reset = handleScrollEvent();
		return () => reset?.();
	}, [scrollContainer, tabs]);

	useEffect(() => {
		const path = pathname?.split('/')?.at(-1);
		const item = NEW_TAB_ITEMS.find((item) => item.path === path);

		if (!item) return;

		const openTab = tabs.find((tab) => tab.path?.split('/')?.at(-1) === item.path);
		if (openTab) {
			setCurrentTab(versionId, openTab.id);
		} else {
			addTab(versionId, {
				id: generateId(),
				title: item.title,
				path: item.path,
				isDashboard: false,
				isActive: true,
			});
		}
	}, [pathname]);

	function getDashboardPath() {
		const matched = matches.at(-1);
		if (!matched) return '/organization';

		const { appId, orgId, versionId } = matched.params;

		return `/organization/${orgId}/apps/${appId}/version/${versionId}`;
	}

	function handleScrollEvent() {
		const container = scrollContainer.current;
		if (!container) return;

		const handleScroll = () => {
			setIsScrollable(container.scrollWidth > container.clientWidth);
			setEndOfScroll(container.scrollLeft + container.clientWidth >= container.scrollWidth);
			setStartOfScroll(container.scrollLeft === 0);
		};

		handleScroll();

		container.addEventListener('scroll', handleScroll);

		const resizeObserver = new ResizeObserver(() => {
			handleScroll();
		});

		resizeObserver.observe(container);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			resizeObserver.disconnect();
		};
	}

	function tabRemoveHandler(tab: Tab) {
		const prevTab = getPreviousTab(versionId, tab.id);
		removeTab(versionId, tab.id);
		if (tab.isActive && prevTab) {
			console.log(prevTab);
			setCurrentTab(versionId, prevTab?.id as string);
			navigate(`${prevTab.path}?tabId=${prevTab.id}`);
		}
	}

	function move(type: 'next' | 'prev') {
		const container = scrollContainer.current;
		if (!container) return;

		const scrollAmount = SCROLL_AMOUNT;

		if (type === 'next') {
			container.scrollLeft += scrollAmount;
		} else {
			container.scrollLeft -= scrollAmount;
		}
	}

	return (
		<div className='navigation-tab-container'>
			<div ref={scrollContainer} className='tab'>
				{tabs.map((tab) => (
					<TabItem
						active={tab.isActive}
						data-active={tab.isActive ? 'true' : undefined}
						icon={tab.isDashboard ? <Dashboard /> : undefined}
						onClose={() => tabRemoveHandler(tab)}
						onClick={() => setCurrentTab(versionId, tab.id)}
						closeable={!tab.isDashboard}
						to={`${tab.path}?tabId=${tab.id}`}
						key={tab.id}
					>
						{tab.title}
					</TabItem>
				))}
			</div>
			<div className='tab-control'>
				{isScrollable && (
					<div className='tab-control-item navigation'>
						<Button
							rounded
							variant='blank'
							iconOnly
							onClick={() => move('prev')}
							disabled={startOfScroll}
						>
							<CaretLeft size={15} />
						</Button>
						<Button
							rounded
							variant='blank'
							iconOnly
							onClick={() => move('next')}
							disabled={endOfScroll}
						>
							<CaretRight size={15} />
						</Button>
					</div>
				)}
				<div className='tab-control-item'>
					<NewTabDropdown />
				</div>
				<div className='tab-control-item'>
					<TabOptionsDropdown getDashboardPath={getDashboardPath} />
				</div>
			</div>
		</div>
	);
}
