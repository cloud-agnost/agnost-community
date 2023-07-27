import { SVGProps } from 'react';
const SvgDashboard = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 18 18'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M8 18H2c-1.1 0-2-.9-2-2V2C0 .9.9 0 2 0h6v18Zm2 0h6c1.1 0 2-.9 2-2V9h-8v9Zm8-11V2c0-1.1-.9-2-2-2h-6v7h8Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgDashboard;
