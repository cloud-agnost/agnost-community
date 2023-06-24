import * as React from 'react';
import { SVGProps } from 'react';
const SvgTeam = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='1em'
		height='1em'
		viewBox='0 0 22 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<path
			d='M17 13.837c1.456.731 2.704 1.905 3.615 3.373.18.29.27.436.302.637.063.409-.216.912-.597 1.073-.188.08-.398.08-.82.08M15 9.532a4.5 4.5 0 0 0 0-8.064M13 5.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM1.56 16.938C3.152 14.545 5.67 13 8.5 13s5.346 1.545 6.94 3.938c.35.525.524.787.504 1.122-.015.26-.186.58-.395.738-.267.202-.635.202-1.371.202H2.822c-.736 0-1.104 0-1.372-.202a1.109 1.109 0 0 1-.395-.738c-.02-.335.155-.597.504-1.122Z'
			stroke='#929AB5'
			strokeWidth={1.5}
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);
export default SvgTeam;
