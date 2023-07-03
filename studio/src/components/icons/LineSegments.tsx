import { SVGProps } from 'react';
const SvgLineSegments = (props: SVGProps<SVGSVGElement>): JSX.Element => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 21 22'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M17.233 12.35a3.36 3.36 0 0 0-2.513 1.129l-1.397-.844a4.745 4.745 0 0 0-.96-5.244l1.99-2.533a2.543 2.543 0 0 0 3.578-2.318c0-1.4-1.139-2.54-2.54-2.54a2.543 2.543 0 0 0-2.484 3.068c.08.382.248.731.479 1.029l-1.99 2.532a4.732 4.732 0 0 0-2.432-.67c-1.206 0-2.308.451-3.148 1.193l-1.212-1.06a2.08 2.08 0 0 0 .136-1.288 2.097 2.097 0 0 0-2.047-1.658A2.096 2.096 0 0 0 .6 5.24a2.096 2.096 0 0 0 3.193 1.78l1.212 1.06a4.747 4.747 0 0 0 .631 6.044L4.13 16.128a2.543 2.543 0 0 0-3.53 2.34c0 1.4 1.14 2.54 2.541 2.54a2.543 2.543 0 0 0 2.493-3.027 2.532 2.532 0 0 0-.52-1.112l1.507-2.005a4.755 4.755 0 0 0 6.065-1.176l1.396.844a3.349 3.349 0 0 0-.153 1.83 3.372 3.372 0 0 0 3.305 2.721 3.37 3.37 0 0 0 3.367-3.367 3.37 3.37 0 0 0-3.367-3.367ZM15.392 1.23a1.31 1.31 0 0 1 0 2.618 1.31 1.31 0 0 1-1.31-1.309c0-.721.588-1.309 1.31-1.309Zm-12.7 4.87a.863.863 0 0 1 0-1.724.863.863 0 0 1 0 1.724Zm.448 13.675a1.31 1.31 0 0 1-1.31-1.309 1.31 1.31 0 0 1 2.618 0 1.31 1.31 0 0 1-1.308 1.31Zm5.824-5.525a3.534 3.534 0 0 1-3.53-3.53 3.534 3.534 0 0 1 3.53-3.53 3.534 3.534 0 0 1 3.53 3.53 3.534 3.534 0 0 1-3.53 3.53Zm8.269 3.6a2.138 2.138 0 0 1-2.136-2.135c0-1.177.958-2.135 2.136-2.135 1.177 0 2.135.958 2.135 2.135a2.138 2.138 0 0 1-2.135 2.136Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgLineSegments;
