import { useEffect } from 'react';

import React from 'react';
export const DEFAULT_THEME = 'light';

export const withTailwindTheme = (Story: any, context: any) => {
	const { theme } = context.globals;
	const sbRoot = document.getElementsByClassName('sb-show-main')[0];
	sbRoot.classList.add('sb-show-main--' + theme);
	useEffect(() => {
		const htmlTag = document.documentElement;

		// Set the "data-mode" attribute on the iFrame html tag
		htmlTag.setAttribute('data-mode', theme || DEFAULT_THEME);
	}, [theme]);

	return <Story />;
};
