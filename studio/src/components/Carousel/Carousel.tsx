import { cn } from '@/utils';
import { ReactElement } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Autoplay, FreeMode, Grid, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { GridOptions } from 'swiper/types';
import './Carousel.scss';

interface CarouselProps {
	className?: string;
	loop?: boolean;
	autoplay?: boolean;
	spaceBetween?: number;
	pagination?: boolean;
	slidesPerView?: number;
	grid?: GridOptions;
	freeMode?: boolean;

	items: {
		text?: string;
		element: ReactElement;
	}[];
}

export default function Carousel({
	items,
	className,
	loop,
	autoplay,
	slidesPerView = 1,
	spaceBetween = 10,
	pagination,
	grid,
	freeMode,

	...props
}: CarouselProps) {
	return (
		<Swiper
			spaceBetween={spaceBetween}
			pagination={pagination}
			freeMode={freeMode}
			loop={loop}
			autoplay={autoplay}
			className={cn('carousel', className)}
			slidesPerView={slidesPerView}
			grid={grid}
			modules={[
				pagination && Pagination,
				autoplay && Autoplay,
				!!grid && Grid,
				freeMode && FreeMode,
			].filter(Boolean)}
			{...props}
		>
			{items.map(({ element, text }, index) => (
				<SwiperSlide className='carousel-item' key={index}>
					<div className='carousel-item-cover'>{element}</div>
					{text && <div className='carousel-item-text'>{text}</div>}
				</SwiperSlide>
			))}
		</Swiper>
	);
}
