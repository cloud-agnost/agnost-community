import * as React from 'react';
import { SVGProps } from 'react';
const SvgEmptyBucket = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 108 148'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g stroke='#949AB3' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
			<path
				d='M54.89 49.47c28.326 0 51.29-7.7 51.29-17.2s-22.964-17.2-51.29-17.2c-28.327 0-51.29 7.7-51.29 17.2s22.963 17.2 51.29 17.2Z'
				fill='url(#EmptyBucket_svg__a)'
			/>
			<path d='m13.86 106.05 41.03 40.9M8.86 70.1l73.04 72.81M8.26 39.29l84.87 86.91M48.09 49.32l48.94 48.79M78.37 47.57l22.61 22.53M94.89 113.48l-33.33 33.23M99.59 79.75l-65.21 65M104.77 40.64l-87.76 89.88M64.41 49.17l-51.74 51.58M33.25 47.87 9.12 71.93M54.89 49.47c-26.79 0-48.77-6.89-51.08-15.67l13.64 98.09c1.26 8.5 16.76 15.06 37.44 15.06 20.68 0 35.41-6.16 37.44-15.06l13.64-98.09c-2.3 8.78-24.29 15.67-51.08 15.67ZM9.8 17.02 1 11.92M19.14 12.69l2.05-8.71M13.31 12.99 8.5 1.98' />
		</g>
		<defs>
			<linearGradient
				id='EmptyBucket_svg__a'
				x1={0.82}
				y1={-25.03}
				x2={71.23}
				y2={49.58}
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
export default SvgEmptyBucket;
