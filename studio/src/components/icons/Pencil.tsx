import { SVGProps } from 'react';
const SvgPencil = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 18 17'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M9 15.667h7.5m-15 0h1.395c.408 0 .612 0 .804-.046.17-.041.332-.109.482-.2.168-.103.312-.247.6-.535L15.25 4.416a1.768 1.768 0 1 0-2.5-2.5L2.281 12.387c-.288.288-.432.432-.535.6-.092.15-.16.312-.2.482-.046.192-.046.396-.046.803v1.396Z'
			stroke='currentColor'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgPencil;
