import { SVGProps } from 'react';
const SvgEmptyInvitation = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 147 134'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M2.78 51.8 54.05 5.61C60.06.2 69.18.2 75.18 5.61l51.269 46.19-61.83 40.99L2.79 51.8h-.01Z'
			fill='#191C28'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M6.47 132.83h116.92c1.61-.15 2.68-.73 3.39-1.45 1.36-1.36.91-3.7-.71-4.74L8.23 51.2c-1.73-1.11-4.12-.98-5.44.59-.71.84-1.13 1.92-1.13 3.1V128c0 2.66 2.16 4.82 4.82 4.82l-.01.01Z'
			fill='url(#EmptyInvitation_svg__a)'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M122.76 132.83H5.84c-1.61-.15-2.68-.73-3.39-1.45-1.36-1.36-.91-3.7.71-4.74L121 51.2c1.73-1.11 4.12-.98 5.44.59.71.84 1.13 1.92 1.13 3.1V128c0 2.66-2.16 4.82-4.82 4.82l.01.01Z'
			fill='#191C28'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m134.97 49.67 10.43-1.41M127.74 41.85l1.46-9.14M133.189 44.43l8.94-8.64'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<defs>
			<linearGradient
				id='EmptyInvitation_svg__a'
				x1={-22.46}
				y1={25.82}
				x2={133.88}
				y2={211.07}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3770F3' />
				<stop offset={0.03} stopColor='#3366DC' />
				<stop offset={0.09} stopColor='#2C52AC' />
				<stop offset={0.15} stopColor='#264284' />
				<stop offset={0.22} stopColor='#213462' />
				<stop offset={0.28} stopColor='#1D2948' />
				<stop offset={0.35} stopColor='#1B2236' />
				<stop offset={0.42} stopColor='#191D2B' />
				<stop offset={0.5} stopColor='#191C28' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyInvitation;
