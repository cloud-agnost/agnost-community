import { Swiper, SwiperSlide } from 'swiper/react';
import { cn } from '@/utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Autoplay, Pagination } from 'swiper';
import './Slider.scss';

interface SliderProps {
	className?: string;
	items: {
		text: string;
		image: string;
	}[];
}

export default function Slider({ items, className }: SliderProps) {
	return (
		<Swiper
			spaceBetween={10}
			pagination
			loop
			autoplay
			className={cn('slider', className)}
			modules={[Pagination, Autoplay]}
		>
			{items.map(({ image, text }, index) => (
				<SwiperSlide className='slider-item' key={index}>
					<div className='slider-item-cover'>
						<img src={image} alt={text} />
					</div>
					<div className='slider-item-text'>{text}</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
