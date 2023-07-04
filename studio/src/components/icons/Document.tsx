import { SVGProps } from 'react';
const SvgDocument = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M16.142 2H4.33v20H19.67V5.506L16.142 2Zm-.225 1.429 2.256 2.243h-2.256V3.429Zm2.58 17.4H5.502V3.171h9.243v3.672h3.752v13.984Z'
			fill='currentColor'
		/>
		<path
			d='M9.927 16.688h4.145v1.171H9.927v-1.172ZM7.69 13.602h8.617v1.171H7.69v-1.171ZM7.69 10.516h8.617v1.171H7.69v-1.171ZM7.69 7.43H12v1.172H7.69V7.43Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgDocument;
