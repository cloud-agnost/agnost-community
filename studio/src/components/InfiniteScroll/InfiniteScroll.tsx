import _ from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollProps {
	items: any[];
	children: React.ReactNode;
	className?: string;
	endOfList: () => void;
}

export default function InfiniteScroll({
	items,
	children,
	className,
	endOfList,
}: InfiniteScrollProps) {
	const { ref: inViewRef, inView } = useInView();
	const ref = useRef();
	const handleEndOfList = () => {
		if (!_.isNil(items)) {
			endOfList();
		}
	};
	const setRefs = useCallback(
		(node) => {
			ref.current = node;
			inViewRef(node);
		},
		[inViewRef],
	);
	useEffect(() => {
		if (inView) handleEndOfList();
	}, [inView]);
	return (
		<div id='infinite-scroll' className={className}>
			{children}
			<div ref={setRefs} />
		</div>
	);
}
