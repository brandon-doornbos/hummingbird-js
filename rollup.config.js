import jsdoc from 'rollup-plugin-jsdoc';
import { terser } from "rollup-plugin-terser";

export default [
	{
		input: './src/index.js',
		output: {
			file: 'dist/hummingbird.js',
			format: 'iife',
			name: 'HB',
			intro: '/* Hummingbird by SantaClausNL, https://github.com/brandon-doornbos/hummingbird-js */'
		},
		plugins: [
			jsdoc({
				args: ['-d', 'docs'],
				config: 'jsdoc.config.json',
			})
		]
	}, {
		input: './src/index.js',
		output: {
			file: 'dist/hummingbird.min.js',
			format: 'iife',
			name: 'HB',
			intro: '/* Hummingbird by SantaClausNL, https://github.com/brandon-doornbos/hummingbird-js */'
		},
		plugins: [
			terser({
				ecma: 2015
			})
		]
	}
]
