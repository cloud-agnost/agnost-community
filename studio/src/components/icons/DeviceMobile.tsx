import { SVGProps } from 'react';
const SvgDeviceMobile = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g stroke='currentColor' strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'>
			<path d='M16.5 2.25h-9A1.5 1.5 0 0 0 6 3.75v16.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V3.75a1.5 1.5 0 0 0-1.5-1.5ZM6 6h12M6 18h12' />
		</g>
	</svg>
);
export default SvgDeviceMobile;
