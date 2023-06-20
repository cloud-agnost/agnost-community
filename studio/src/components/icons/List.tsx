import * as React from 'react';
import { SVGProps } from 'react';
const SvgList = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 20 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M16.875 5.875H3.125a.563.563 0 1 1 0-1.125h13.75a.562.562 0 1 1 0 1.125Z'
			fill='currentColor'
			stroke='currentColor'
			strokeWidth={0.125}
		/>
		<path
			d='M16.875 7.813H3.125a.625.625 0 0 0 0 1.25h13.75a.625.625 0 1 0 0-1.25ZM16.875 10.938H3.125a.625.625 0 1 0 0 1.25h13.75a.625.625 0 1 0 0-1.25ZM16.875 14.063H3.125a.625.625 0 1 0 0 1.25h13.75a.625.625 0 1 0 0-1.25Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgList;
