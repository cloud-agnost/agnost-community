import { SVGProps } from 'react';
const SvgRefresh = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='m1.662 10.89 1.821.487.489-1.821M12.028 6.444l.488-1.821 1.822.488'
			fill='currentColor'
		/>
		<path
			d='M5.698 13.178a5.667 5.667 0 0 0 7.21-8.012l-.167-.288m-9.649 5.956a5.667 5.667 0 0 1 7.21-8.012m-8.64 8.067 1.821.488.489-1.821m8.056-3.112.488-1.821 1.822.488'
			stroke='currentColor'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgRefresh;
