import { SVGProps } from 'react';
const SvgEnvironment = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 21 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<mask
			id='Environment_svg__a'
			style={{
				maskType: 'luminance',
			}}
			maskUnits='userSpaceOnUse'
			x={0}
			y={0}
			width={21}
			height={21}
		>
			<path d='M.2 0h20v20H.2V0Z' fill='#fff' />
		</mask>
		<g mask='url(#Environment_svg__a)'>
			<path
				d='M19.809 4.141v14.063H.589V1.797h19.22v2.344Z'
				stroke='currentColor'
				strokeWidth={1.3}
				strokeMiterlimit={10}
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</g>
		<path
			d='m13.715 6.485-3.516 2.05v4.07l3.525 2.034 3.506-2.034v-4.07l-3.515-2.05Z'
			stroke='currentColor'
			strokeWidth={1.3}
			strokeMiterlimit={10}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='m10.2 12.604 3.524-2.035 3.506 2.035M13.715 10.57V6.485M4.34 6.656h2.344M3.168 9h4.687M3.168 11.344h4.687M3.168 13.688h4.687'
			stroke='currentColor'
			strokeWidth={1.3}
			strokeMiterlimit={10}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgEnvironment;
