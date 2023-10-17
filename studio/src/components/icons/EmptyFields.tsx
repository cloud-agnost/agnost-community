import { SVGProps } from 'react';
const SvgEmptyFields = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 154 126'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M13.38 12.38H152.8v95.58c0 3.53-2.86 6.39-6.39 6.39H19.78c-3.53 0-6.39-2.86-6.39-6.39V12.38h-.01Z'
			fill='#191C28'
			stroke='#677393'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M48.87 11.84v101.99M83.09 11.64V114M118.97 11.64v101.99'
			stroke='#BDBFC1'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<path
			d='M19.72 1.7h126.74c3.5 0 6.34 2.84 6.34 6.34v6.04H13.38V8.04c0-3.5 2.84-6.34 6.34-6.34Z'
			fill='url(#EmptyFields_svg__a)'
			stroke='#677393'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M14.02 39.15h137.44M13.81 64.22H152.4M13.3 88.61h138.88'
			stroke='#677393'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<path
			d='M1.37 22.68h139.42v95.58c0 3.53-2.86 6.39-6.39 6.39H7.77c-3.53 0-6.39-2.86-6.39-6.39V22.68h-.01Z'
			fill='#191C28'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M36.86 22.13v102M71.08 21.94V124.3M106.96 21.94v101.99'
			stroke='#949AB3'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<path
			d='M7.71 12h126.74c3.5 0 6.34 2.84 6.34 6.34v6.04H1.37v-6.04c0-3.5 2.84-6.34 6.34-6.34Z'
			fill='url(#EmptyFields_svg__b)'
			stroke='#949AB3'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M2.01 49.44h137.45M1.81 74.52h138.58M1.3 98.91h138.87'
			stroke='#949AB3'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='EmptyFields_svg__a'
				x1={53.91}
				y1={-65.73}
				x2={118.92}
				y2={104.03}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3770F3' />
				<stop offset={0.05} stopColor='#3468E0' />
				<stop offset={0.23} stopColor='#2C51A8' />
				<stop offset={0.4} stopColor='#253E7A' />
				<stop offset={0.56} stopColor='#1F2F56' />
				<stop offset={0.71} stopColor='#1C243D' />
				<stop offset={0.85} stopColor='#191E2D' />
				<stop offset={0.96} stopColor='#191C28' />
			</linearGradient>
			<linearGradient
				id='EmptyFields_svg__b'
				x1={41.9}
				y1={-55.43}
				x2={106.91}
				y2={114.33}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3770F3' />
				<stop offset={0.18} stopColor='#2D54B1' />
				<stop offset={0.35} stopColor='#243C76' />
				<stop offset={0.5} stopColor='#1E2A4B' />
				<stop offset={0.62} stopColor='#1A2031' />
				<stop offset={0.68} stopColor='#191C28' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyFields;
