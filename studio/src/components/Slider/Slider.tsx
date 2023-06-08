import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import { Pagination, Autoplay } from 'swiper';
import { ReactElement } from 'react';
import './Slider.scss';

interface SliderProps {
	items: {
		text: string;
		element: ReactElement;
	}[];
}

export default function Slider({ items }: SliderProps) {
	return (
		<Swiper
			spaceBetween={10}
			pagination
			loop
			className='slider'
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
