import { SVGProps } from 'react';
const SvgSquaresFour = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 20 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M3.75 3.188h5c.31 0 .563.251.563.562v5c0 .31-.252.563-.563.563h-5a.563.563 0 0 1-.563-.563v-5c0-.31.252-.563.563-.563Z'
			fill='#929AB5'
			stroke='#929AB5'
			strokeWidth={0.125}
		/>
		<path
			d='M16.25 3.125h-5a.625.625 0 0 0-.625.625v5c0 .345.28.625.625.625h5c.345 0 .625-.28.625-.625v-5a.625.625 0 0 0-.625-.625ZM8.75 10.625h-5a.625.625 0 0 0-.625.625v5c0 .345.28.625.625.625h5c.345 0 .625-.28.625-.625v-5a.625.625 0 0 0-.625-.625ZM16.25 10.625h-5a.625.625 0 0 0-.625.625v5c0 .345.28.625.625.625h5c.345 0 .625-.28.625-.625v-5a.625.625 0 0 0-.625-.625Z'
			fill='#929AB5'
		/>
	</svg>
);
export default SvgSquaresFour;
