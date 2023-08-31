import { SVGProps } from 'react';
const SvgEmptyApps = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 172 172'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<g strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
			<path
				d='M139.99 47.22H21.9a4.73 4.73 0 0 0-4.73 4.73v77.55a4.73 4.73 0 0 0 4.73 4.73h118.09a4.73 4.73 0 0 0 4.73-4.73V51.95a4.73 4.73 0 0 0-4.73-4.73Z'
				fill='#191C28'
				stroke='#677393'
			/>
			<path
				d='M144.72 62.59H17.17v-11c0-2.42 1.96-4.37 4.37-4.37h118.81c2.42 0 4.37 1.96 4.37 4.37v11Z'
				fill='url(#EmptyApps_svg__a)'
				stroke='#677393'
			/>
			<path
				d='M132.82 54.88H14.73A4.73 4.73 0 0 0 10 59.61v77.55a4.73 4.73 0 0 0 4.73 4.73h118.09a4.73 4.73 0 0 0 4.73-4.73V59.61a4.73 4.73 0 0 0-4.73-4.73Z'
				fill='#191C28'
				stroke='#949AB3'
			/>
			<path
				d='M137.56 70.25H10.01v-11c0-2.42 1.96-4.37 4.37-4.37h118.81c2.42 0 4.37 1.96 4.37 4.37v11Z'
				fill='url(#EmptyApps_svg__b)'
				stroke='#949AB3'
			/>
			<path
				d='m55.54 90.73-16.85 15.19 17.27 15.61M80.94 81.17l-17.72 47.34M88.22 90.73l16.851 15.19-17.27 15.61M151.949 47.95l10.43-1.41M144.721 40.14l1.46-9.14M150.17 42.72l8.94-8.64'
				stroke='#949AB3'
			/>
		</g>
		<defs>
			<linearGradient
				id='EmptyApps_svg__a'
				x1={50.19}
				y1={-24.4}
				x2={95.42}
				y2={94.86}
				gradientUnits='userSpaceOnUse'
			>
				<stop offset={0.05} stopColor='#3770F3' />
				<stop offset={0.3} stopColor='#2D54B1' />
				<stop offset={0.54} stopColor='#243C76' />
				<stop offset={0.74} stopColor='#1E2A4B' />
				<stop offset={0.9} stopColor='#1A2031' />
				<stop offset={1} stopColor='#191C28' />
			</linearGradient>
			<linearGradient
				id='EmptyApps_svg__b'
				x1={43.03}
				y1={-16.75}
				x2={88.25}
				y2={102.52}
				gradientUnits='userSpaceOnUse'
			>
				<stop offset={0.05} stopColor='#3770F3' />
				<stop offset={0.3} stopColor='#2D54B1' />
				<stop offset={0.54} stopColor='#243C76' />
				<stop offset={0.74} stopColor='#1E2A4B' />
				<stop offset={0.9} stopColor='#1A2031' />
				<stop offset={1} stopColor='#191C28' />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyApps;
