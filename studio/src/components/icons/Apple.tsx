import * as React from 'react';
import { SVGProps } from 'react';
const SvgApple = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		xmlnsXlink='http://www.w3.org/1999/xlink'
		{...props}
	>
		<g clipPath='url(#Apple_svg__a)'>
			<path fill='url(#Apple_svg__b)' d='M0 0h24v24H0z' />
		</g>
		<defs>
			<clipPath id='Apple_svg__a'>
				<rect width={24} height={24} rx={12} fill='currentColor' />
			</clipPath>
			<pattern id='Apple_svg__b' patternContentUnits='objectBoundingBox' width={1} height={1}>
				<use xlinkHref='#Apple_svg__c' transform='scale(.0025)' />
			</pattern>
			<image
				id='Apple_svg__c'
				width={400}
				height={400}
				xlinkHref='data:image/jpeg;base64,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'
			/>
		</defs>
	</svg>
);
export default SvgApple;
