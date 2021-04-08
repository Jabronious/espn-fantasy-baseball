module.exports = {
	extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {},
		},
	},
	rules: {
		'@typescript-eslint/no-useless-constructor': 'error',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
		'@typescript-eslint/interface-name-prefix': ['off', { prefixWithI: 'never' }],
		'import/no-extraneous-dependencies': [2, { devDependencies: ['**/*.spec.ts*'] }],
		'import/extensions': ['error', 'never'],
		'import/prefer-default-export': 'off',
		'no-useless-constructor': 'off',
		'no-tabs': ['error', { allowIndentationTabs: true }],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'class-methods-use-this': 'off',
	},
	env: { jest: true },
};
