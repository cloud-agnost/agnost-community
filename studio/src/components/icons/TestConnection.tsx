import * as React from 'react';
import { SVGProps } from 'react';
const SvgTestConnection = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 17 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g fill='currentColor'>
			<path
				d='M8.5 14.375A6.381 6.381 0 0 0 14.875 8 6.375 6.375 0 1 0 8.5 14.375ZM4.82 2.492A6.625 6.625 0 0 1 8.5 1.375 6.633 6.633 0 0 1 15.125 8 6.625 6.625 0 1 1 4.819 2.492Z'
				stroke='currentColor'
				strokeWidth={0.75}
			/>
			<path
				d='M7.092 10.375h.266l.088-.25a1.123 1.123 0 1 1 0 .75l-.09-.25H4.5a.125.125 0 0 1 0-.25h2.592Zm1.408 1a.876.876 0 0 0 .875-.875.875.875 0 0 0-1.733-.17l.368.072-.368-.073a.875.875 0 0 0 .858 1.046Z'
				stroke='currentColor'
				strokeWidth={0.75}
			/>
			<path d='M4.965 4.464A4.967 4.967 0 0 0 3.5 8a.5.5 0 1 0 1 0 4 4 0 1 1 6.828 2.829.5.5 0 1 0 .707.707 5 5 0 0 0-7.07-7.072Z' />
		</g>
	</svg>
);
export default SvgTestConnection;
