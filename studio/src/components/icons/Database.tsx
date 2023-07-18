import * as React from 'react';
import { SVGProps } from 'react';
const SvgDatabase = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M12 2.25c-5.047 0-9 2.306-9 5.25v9c0 2.944 3.953 5.25 9 5.25 5.047 0 9-2.306 9-5.25v-9c0-2.944-3.953-5.25-9-5.25ZM19.5 12c0 .902-.738 1.821-2.026 2.524-1.45.79-3.394 1.226-5.474 1.226s-4.025-.436-5.474-1.226C5.238 13.82 4.5 12.902 4.5 12v-1.56c1.6 1.403 4.334 2.31 7.5 2.31 3.166 0 5.9-.907 7.5-2.31V12Zm-2.026 7.024c-1.45.79-3.394 1.226-5.474 1.226s-4.025-.436-5.474-1.226C5.238 18.32 4.5 17.402 4.5 16.5v-1.56c1.6 1.403 4.334 2.31 7.5 2.31 3.166 0 5.9-.907 7.5-2.31v1.56c0 .902-.738 1.821-2.026 2.524Z'
			fill='currentColor'
		/>
	</svg>
);
export default SvgDatabase;
