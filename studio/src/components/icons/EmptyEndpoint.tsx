import * as React from 'react';
import { SVGProps } from 'react';
const SvgEmptyEndpoint = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 172 172'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g stroke='#949AB3' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
			<path
				d='M86.29 145.11c32.678 0 59.169-26.492 59.169-59.17 0-32.68-26.491-59.17-59.17-59.17S27.12 53.26 27.12 85.94c0 32.678 26.491 59.17 59.17 59.17Z'
				fill='#191C28'
			/>
			<path
				d='M100.439 45.58h-28.29a4.19 4.19 0 0 0-4.19 4.19v72.35a4.19 4.19 0 0 0 4.19 4.19h28.29a4.19 4.19 0 0 0 4.19-4.19V49.77a4.19 4.19 0 0 0-4.19-4.19Z'
				fill='url(#EmptyEndpoint_svg__a)'
			/>
			<path
				d='M86.45 71.779a8.61 8.61 0 1 0 0-17.22 8.61 8.61 0 0 0 0 17.22ZM86.45 93.84a8.61 8.61 0 1 0 0-17.22 8.61 8.61 0 0 0 0 17.22ZM86.45 115.89a8.61 8.61 0 1 0 0-17.22 8.61 8.61 0 0 0 0 17.22Z'
				fill='#191C28'
			/>
		</g>
		<defs>
			<linearGradient
				id='EmptyEndpoint_svg__a'
				x1={7.159}
				y1={30.14}
				x2={140.939}
				y2={124.48}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3770F3' />
				<stop offset={0.05} stopColor='#3366DC' />
				<stop offset={0.18} stopColor='#2C52AC' />
				<stop offset={0.3} stopColor='#264284' />
				<stop offset={0.43} stopColor='#213462' />
				<stop offset={0.56} stopColor='#1D2948' />
				<stop offset={0.7} stopColor='#1B2236' />
				<stop offset={0.84} stopColor='#191D2B' />
				<stop offset={1} stopColor='#191C28' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyEndpoint;
