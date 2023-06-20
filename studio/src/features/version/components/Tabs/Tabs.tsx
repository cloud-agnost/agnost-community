import './tabs.scss';
import { TabItem } from '@/features/version/components/Tabs';
import { Dashboard } from 'components/icons';
import { CaretRight, CaretLeft, Plus, DotsThreeVertical } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useEffect, useRef, useState } from 'react';

const SCROLL_AMOUNT = 200;

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [endOfScroll, setEndOfScroll] = useState(false);
	const [startOfScroll, setStartOfScroll] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const [tabs, setTabs] = useState([1, 2, 3]);

	useEffect(() => {
		const reset = handleScrollEvent();
		return () => reset?.();
	}, [scrollContainer, tabs]);

	useEffect(() => {
		console.log({ endOfScroll });
	}, [endOfScroll]);

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

	function addTab() {
		setTabs([...tabs, tabs.length + 1]);
	}

	return (
		<div className='tab-container'>
			<div ref={scrollContainer} className='tab'>
				<TabItem icon={<Dashboard />} to='/'>
					Dashboard
				</TabItem>
				{tabs.map((i) => (
					<TabItem
						onClose={() => {
							setTabs(tabs.filter((tab) => tab !== i));
						}}
						closeable
						to='/'
						key={i}
					>
						Dashboard {i + 1}
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
					<Button variant='blank' iconOnly onClick={addTab}>
						<Plus size={20} />
					</Button>
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
