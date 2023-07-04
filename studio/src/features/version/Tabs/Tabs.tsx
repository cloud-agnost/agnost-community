import { NewTabDropdown, TabItem, TabOptionsDropdown } from '@/features/version/Tabs/index.ts';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Dashboard } from 'components/icons';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import './tabs.scss';
import useTabStore from '@/store/version/tabStore.ts';

const SCROLL_AMOUNT = 200;

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [endOfScroll, setEndOfScroll] = useState(false);
	const [startOfScroll, setStartOfScroll] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const { tabs, removeTab, currentTab, setCurrentTab, addTab } = useTabStore();
	const { t } = useTranslation();
	const matches = useMatches();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	useEffect(() => {
		const reset = handleScrollEvent();
		return () => reset?.();
	}, [scrollContainer, tabs]);

	useEffect(() => {
		const path = pathname?.split('/')?.at(-1);
		const item = NEW_TAB_ITEMS.find((item) => item.path === path);
		if (!item) return;
		addTab(item);
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

	function tabRemoveHandler(id: string) {
		const condition = currentTab?.id === id;
		const redirectPath = removeTab(id);

		const path = redirectPath ?? getDashboardPath();

		if (condition) {
			setTimeout(() => {
				navigate(path);
			}, 1);
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
				<TabItem onClick={() => setCurrentTab(null)} icon={<Dashboard />} to={getDashboardPath()}>
					{t('version.dashboard')}
				</TabItem>
				{tabs.map((tab) => (
					<TabItem
						onClose={() => tabRemoveHandler(tab.id)}
						onClick={() => setCurrentTab(tab)}
						closeable
						to={tab.path}
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
