import { SVGProps } from 'react';
const SvgChangeLog = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M15.5 3.312a2.812 2.812 0 1 0-3.438 2.742v.07a1.252 1.252 0 0 1-1.25 1.25l-5.624.001a1.25 1.25 0 0 1-1.25-1.25v-.071a2.813 2.813 0 1 0-1.25 0v.071a2.5 2.5 0 0 0 2.5 2.5h2.187v1.32a2.812 2.812 0 1 0 1.25 0v-1.32h2.188a2.503 2.503 0 0 0 2.5-2.5v-.071A2.817 2.817 0 0 0 15.5 3.312Zm-5.937 9.376a1.563 1.563 0 1 1-3.126 0 1.563 1.563 0 0 1 3.126 0Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgChangeLog;
