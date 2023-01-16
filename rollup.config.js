import parseColors from './rollup-plugin-parse-colors.js';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsdoc from 'rollup-plugin-jsdoc';
import terser from '@rollup/plugin-terser';
import packageInfo from './package.json' assert {type: "json"};

export default [{
	input: packageInfo.main,
	output: [{
		file: 'dist/hummingbird.js',
		format: 'iife',
		name: 'HB'
	}, {
		file: 'dist/' + packageInfo.version + '/hummingbird.js',
		format: 'iife',
		name: 'HB'
	}, {
		file: 'dist/hummingbird.min.js',
		format: 'iife',
		name: 'HB',
		plugins: [terser({ ecma: 2015 })]
	}, {
		file: 'dist/' + packageInfo.version + '/hummingbird.min.js',
		format: 'iife',
		name: 'HB',
		plugins: [terser({ ecma: 2015 })]
	}],
	plugins: [
		parseColors(),
		json(),
		nodeResolve(),
		jsdoc({
			config: 'jsdoc.config.json',
		})
	]
}]
