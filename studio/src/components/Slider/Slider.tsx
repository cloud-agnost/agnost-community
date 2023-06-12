import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Pagination, Autoplay } from 'swiper';
import { ReactElement } from 'react';
import './Slider.scss';
import { cn } from '@/utils';

interface SliderProps {
	className?: string;
	items: {
		text: string;
		element: ReactElement;
	}[];
}

export default function Slider({ items, className }: SliderProps) {
	return (
		<Swiper
			spaceBetween={10}
			pagination
			loop
			className={cn('slider', className)}
			autoplay
			modules={[Pagination, Autoplay]}
		>
			{items.map(({ element, text }, index) => (
				<SwiperSlide className='slider-item' key={index}>
					<div className='slider-item-cover'>{element}</div>
					<div className='slider-item-text'>{text}</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
