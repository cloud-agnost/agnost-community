import './tabs.scss';
import { NewTabDropdown, TabItem } from '@/features/version/components/Tabs/index.ts';
import { Dashboard } from 'components/icons';
import { CaretRight, CaretLeft, DotsThreeVertical } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useEffect, useRef, useState } from 'react';
import { useMatches, useNavigate } from 'react-router-dom';
import useVersionStore from '@/store/version/versionStore.ts';

const SCROLL_AMOUNT = 200;

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [endOfScroll, setEndOfScroll] = useState(false);
	const [startOfScroll, setStartOfScroll] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const { tabs, removeTab } = useVersionStore();
	const matches = useMatches();
	const navigate = useNavigate();

	useEffect(() => {
		const reset = handleScrollEvent();
		return () => reset?.();
	}, [scrollContainer, tabs]);

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
		const redirectPath = removeTab(id);
		console.log({ redirectPath });
		if (redirectPath) navigate(redirectPath);
		else navigate(getDashboardPath());
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
		<div className='tab-container'>
			<div ref={scrollContainer} className='tab'>
				<TabItem icon={<Dashboard />} to={getDashboardPath()}>
					Dashboard
				</TabItem>
				{tabs.map(({ path, title, id }) => (
					<TabItem onClose={() => tabRemoveHandler(id)} closeable to={path} key={id}>
						{title}
					</TabItem>
				))}
			</div>
			<div className='tab-control'>
				{isScrollable && (
					<div className='tab-control-item navigation'>
						<Button variant='blank' iconOnly onClick={() => move('prev')} disabled={startOfScroll}>
							<CaretLeft size={20} />
						</Button>
						<Button variant='blank' iconOnly onClick={() => move('next')} disabled={endOfScroll}>
							<CaretRight size={20} />
						</Button>
					</div>
				)}
				<div className='tab-control-item'>
					<NewTabDropdown />
				</div>
				<div className='tab-control-item'>
					<Button variant='blank' iconOnly>
						<DotsThreeVertical size={20} weight='bold' />
					</Button>
				</div>
			</div>
		</div>
	);
}
