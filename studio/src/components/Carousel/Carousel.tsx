import { ReactElement } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './Carousel.scss';

interface CarouselProps {
	className?: string;
	showArrows: boolean;
	items: {
		text?: string;
		element: ReactElement;
	}[];
}

export default function MainCarousel({ items, showArrows }: CarouselProps) {
	return (
		<Carousel showThumbs={false} showStatus={false} showArrows={showArrows} autoPlay>
			{items.map(({ element, text }) => (
				<div key={text}>
					<div className='carousel-item-cover'>{element}</div>
					{text && <div className='carousel-item-text'>{text}</div>}
				</div>
			))}
		</Carousel>
	);
}
