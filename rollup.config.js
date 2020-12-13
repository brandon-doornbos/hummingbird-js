import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default [
	{
		input: 'src/index.js',
		output: {
			file: 'dist/hummingbird.js',
			format: 'iife',
			name: 'HB',
			intro: '/* Hummingbird by SantaClausNL, https://github.com/SantaClausNL/Hummingbird */'
		}
	},{
		input: 'src/index.js',
		output: {
			file: 'dist/hummingbird.min.js',
			format: 'iife',
			name: 'HB',
			intro: '/* Hummingbird by SantaClausNL, https://github.com/SantaClausNL/Hummingbird */'
		},
		plugins: [
			compiler()
		]
	}
]