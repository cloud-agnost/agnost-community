import { SVGProps } from 'react';
const SvgEmptyFilesLight = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 102 131'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M81.97 1.28H6.6a5.54 5.54 0 0 0-5.54 5.54v106.83a5.54 5.54 0 0 0 5.54 5.54h75.37a5.54 5.54 0 0 0 5.54-5.54V6.82a5.54 5.54 0 0 0-5.54-5.54Z'
			fill='currentColor'
			stroke='#BDBFC1'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M76.62 11.36H18.09c-2.2 0-3.98 1.78-3.98 3.98v109.95c0 2.2 1.78 3.98 3.98 3.98h78.49c2.2 0 3.979-1.78 3.979-3.98V35.48l-23.94-24.12Z'
			fill='currentColor'
			stroke='#6B6D6E'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M80.65 35.48h19.96c.06 0 .09-.07.05-.11L76.62 11.33s-.11-.01-.11.05v19.96c0 2.29 1.85 4.14 4.14 4.14Z'
			fill='url(#EmptyFilesLight_svg__a)'
			stroke='#6B6D6E'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M32.44 43.64h26.14M32.44 57.6h49.79M32.44 71.57h49.79M32.44 85.53h49.79M32.44 99.49h49.79'
			stroke='#6B6D6E'
			strokeWidth={2}
			strokeMiterlimit={10}
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='EmptyFilesLight_svg__a'
				x1={70.86}
				y1={9.93}
				x2={102.91}
				y2={53.52}
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='currentColor' />
				<stop offset={0.15} stopColor='#FBFBFB' />
				<stop offset={0.28} stopColor='#F1F1F1' />
				<stop offset={0.4} stopColor='#E0E0E0' />
				<stop offset={0.51} stopColor='#C8C8C8' />
				<stop offset={0.62} stopColor='#A8A8A8' />
				<stop offset={0.72} stopColor='#828282' />
				<stop offset={0.82} stopColor='#545454' />
				<stop offset={0.92} stopColor='#212121' />
				<stop offset={0.98} />
			</linearGradient>
		</defs>
	</svg>
);
export default SvgEmptyFilesLight;
