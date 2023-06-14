import { cn } from '@/utils';
import { ReactElement } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Autoplay, FreeMode, Grid, Pagination } from 'swiper';
import { GridOptions } from 'swiper/types';
import './Slider.scss';

interface SliderProps {
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

export default function Slider({
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
}: SliderProps) {
	return (
		<Swiper
			spaceBetween={spaceBetween}
			pagination={pagination}
			freeMode={freeMode}
			loop={loop}
			autoplay={autoplay}
			className={cn('slider', className)}
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
				<SwiperSlide className='slider-item' key={index}>
					<div className='slider-item-cover'>{element}</div>
					{text && <div className='slider-item-text'>{text}</div>}
				</SwiperSlide>
			))}
		</Swiper>
	);
}
