import { SVGProps } from 'react';
const SvgTimestamp = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 20 22'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M17.052 10.145V5.101a2.195 2.195 0 0 0-2.18-2.189H14.6V2.57a1.549 1.549 0 0 0-3.098 0v.342H5.823V2.57a1.57 1.57 0 0 0-3.14 0v.342h-.235c-1.199 0-2.175.99-2.175 2.19v11.582c0 1.199.976 2.19 2.175 2.19h6.823A5.93 5.93 0 0 0 13.812 21a5.92 5.92 0 0 0 5.91-5.91c0-2.065-1.078-3.888-2.67-4.945Zm-4.69-7.575a.679.679 0 0 1 .667-.69h.018c.378-.004.688.3.692.677V4.246h-1.377V2.57Zm-8.819 0a.698.698 0 0 1 .708-.69c.386 0 .712.303.712.69v1.676h-1.42V2.57Zm-2.41 2.531c0-.724.59-1.328 1.315-1.328h.235v.921c0 .238.198.412.436.412h2.263c.238 0 .441-.174.441-.412v-.921h5.68v.921a.4.4 0 0 0 .412.412h2.264a.407.407 0 0 0 .42-.412v-.921h.272c.73.007 1.318.599 1.32 1.328v1.382H1.134V5.101Zm1.315 12.912a1.329 1.329 0 0 1-1.314-1.33v-9.34H16.19v2.335a5.904 5.904 0 0 0-2.375-.499c-3.257 0-5.908 2.658-5.908 5.915a5.9 5.9 0 0 0 .767 2.919H2.448Zm11.364 2.119a5.046 5.046 0 1 1 5.046-5.046 5.052 5.052 0 0 1-5.046 5.046Z'
			fill='currentColor'
			stroke='currentColor'
			strokeWidth={0.25}
		/>
		<path
			d='M15.839 15.087h-1.885V12.5a.43.43 0 1 0-.86 0v3.018c.004.24.199.431.438.43h2.307a.43.43 0 0 0 0-.86Z'
			fill='currentColor'
			stroke='currentColor'
			strokeWidth={0.25}
		/>
	</svg>
);
export default SvgTimestamp;