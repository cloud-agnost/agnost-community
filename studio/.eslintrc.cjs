module.exports = {
	env: {
		browser: true,
		node: true,
		es2020: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'plugin:react/recommended',
		'plugin:jsx-a11y/recommended',
		'prettier',
		'plugin:@tanstack/eslint-plugin-query/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['react-refresh', 'react', '@tanstack/query'],
	rules: {
		'react-refresh/only-export-components': 'warn',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'react-hooks/exhaustive-deps': 'off',
		'@tanstack/query/exhaustive-deps': 'error',
		'@tanstack/query/no-rest-destructuring': 'warn',
		'@tanstack/query/stable-query-client': 'error',
	},
};
