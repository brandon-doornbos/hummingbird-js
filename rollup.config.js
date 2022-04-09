import parseColors from './rollup-plugin-parse-colors.js';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsdoc from 'rollup-plugin-jsdoc';
import { terser } from 'rollup-plugin-terser';

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
			parseColors(),
			json(),
			nodeResolve(),
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
			parseColors(),
			json(),
			nodeResolve(),
			terser({
				ecma: 2015
			})
		]
	}
]
