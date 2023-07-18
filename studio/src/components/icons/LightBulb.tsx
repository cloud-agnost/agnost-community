import { SVGProps } from 'react';
const SvgLightBulb = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 16 22'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M5.5 21h5m.5-6.674a∏7 7 0 1 0-6 0V15c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C6.602 18 7.068 18 8 18c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C11 16.398 11 15.932 11 15v-.674Z'
			stroke='currentColor'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgLightBulb;
