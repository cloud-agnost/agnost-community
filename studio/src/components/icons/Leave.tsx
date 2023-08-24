import * as React from 'react';
import { SVGProps } from 'react';
const SvgLeave = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 48 48'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g clipPath='url(#Leave_svg__a)' fill='currentColor'>
			<path d='M3.63.2A1.406 1.406 0 0 0 1.5 1.407v36.75c0 .495.26.952.683 1.206l11.25 8.438a1.408 1.408 0 0 0 2.13-1.206V9.844c0-.495-.26-.952-.683-1.206L3.63.2Zm7.71 28.019a1.406 1.406 0 1 1 .001-2.813 1.406 1.406 0 0 1 0 2.813ZM40.249 15.798a1.406 1.406 0 0 0-2.186 1.17v1.407H25.405c-.777 0-1.406.63-1.406 1.406v2.813c0 .777.629 1.406 1.406 1.406h12.657v1.406a1.406 1.406 0 0 0 2.186 1.17l5.625-4.218a1.407 1.407 0 0 0 0-2.34l-5.625-4.22Z' />
			<path d='M21.187 22.594V19.78a4.224 4.224 0 0 1 4.218-4.218h7.032V1.405C32.437.63 31.807 0 31.03 0H8.05l8.434 6.326a4.241 4.241 0 0 1 1.891 3.518v29.719H31.03c.777 0 1.407-.63 1.407-1.407V26.813h-7.032a4.223 4.223 0 0 1-4.218-4.22Z' />
		</g>
		<defs>
			<clipPath id='Leave_svg__a'>
				<path fill='currentColor' d='M0 0h48v48H0z' />
			</clipPath>
		</defs>
	</svg>
);
export default SvgLeave;
