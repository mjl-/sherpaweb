import includePaths from 'rollup-plugin-includepaths';

let includePathOptions = {
	include: {},
	paths: ['node_modules'],
	external: [],
	extensions: ['.js']
};

export default {
	input: 'work/esgen/main.js',
	output: {
		name: 'sherpaweb',
		file: 'work/js/sherpaweb.js',
		format: 'iife'
	},
	context: '""', // without this, rollup fails on replacing a module-level "this" with "undefined". typescript generated that "this" for await/async.
	plugins: [ includePaths(includePathOptions) ],
};
