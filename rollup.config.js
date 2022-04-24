import parseColors from './rollup-plugin-parse-colors.js';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsdoc from 'rollup-plugin-jsdoc';
import { terser } from 'rollup-plugin-terser';
import { version, main } from './package.json';

export default [{
	input: main,
	output: [{
		file: 'dist/hummingbird.js',
		format: 'iife',
		name: 'HB'
	}, {
		file: 'dist/' + version + '/hummingbird.js',
		format: 'iife',
		name: 'HB'
	}, {
		file: 'dist/hummingbird.min.js',
		format: 'iife',
		name: 'HB',
		plugins: [terser({ ecma: 2015 })]
	}, {
		file: 'dist/' + version + '/hummingbird.min.js',
		format: 'iife',
		name: 'HB',
		plugins: [terser({ ecma: 2015 })]
	}],
	plugins: [
		parseColors(),
		json(),
		nodeResolve(),
		jsdoc({
			args: ['-d', 'docs'],
			config: 'jsdoc.config.json',
		})
	]
}]
