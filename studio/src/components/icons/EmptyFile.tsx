import { SVGProps } from 'react';
const SvgEmptyFile = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 102 130'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M81.91 1H6.54A5.54 5.54 0 0 0 1 6.54v106.83a5.54 5.54 0 0 0 5.54 5.54h75.37a5.54 5.54 0 0 0 5.54-5.54V6.54A5.54 5.54 0 0 0 81.91 1Z'
			fill='#191C28'
			stroke='#677393'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M76.56 11.08H18.03c-2.2 0-3.98 1.78-3.98 3.98v109.95c0 2.2 1.78 3.98 3.98 3.98h78.49c2.2 0 3.98-1.78 3.98-3.98V35.2L76.56 11.08Z'
			fill='#191C28'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M80.59 35.2h19.96c.06 0 .09-.07.05-.11L76.56 11.05s-.11-.01-.11.05v19.96c0 2.29 1.85 4.14 4.14 4.14Z'
			fill='url(#EmptyFile_svg__a)'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M32.38 43.36h26.14'
			stroke='#949AB3'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<path
			d='M32.38 57.32h49.79'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M32.38 71.29h49.79M32.38 85.25h49.79M32.38 99.22h49.79'
			stroke='#949AB3'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='EmptyFile_svg__a'
				x1={64.33}
				y1={0.84}
				x2={96.37}
				y2={44.43}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3770F3' />
				<stop offset={0.23} stopColor='#2D54B1' />
				<stop offset={0.46} stopColor='#243C76' />
				<stop offset={0.66} stopColor='#1E2A4B' />
				<stop offset={0.81} stopColor='#1A2031' />
				<stop offset={0.9} stopColor='#191C28' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyFile;
