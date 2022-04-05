import { gl } from './common.js';
import { shaders } from './shader_source.js';
import { Mat4 } from './math.js';

/**
 * This class instance includes all shader logic.
 * @readonly
 * @type {HB.Shader}
 * @memberof HB
 */
let shader = undefined;

/**
 * (DO NOT USE) Class with all of the shader initialization and handling.
 * @readonly
 * @memberof HB
 */
class Shader {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @param {Function} vertexFunc - Optional function that returns the vertex shader source, [defaults]{@link https://projects.brandond.nl/Hummingbird/docs/shader_source.js.html}.
	 * @param {Function} fragmentFunc - Optional function that returns the fragment shader source, [defaults]{@link https://projects.brandond.nl/Hummingbird/docs/shader_source.js.html}.
	 * @param {Function} shaderInitFunc - Optional function to (for example) initialize uniforms in the shader, [defaults]{@link https://projects.brandond.nl/Hummingbird/docs/shader_source.js.html}.
	 * @memberof HB
	 */
	constructor(vertexFunc = shaders.colored.vertex, fragmentFunc = shaders.colored.fragment, shaderInitFunc = shaders.colored.init) {
		/**
		 * (DO NOT USE) Internal variable to keep track of the vertex source for compilation.
		 * @readonly
		 */
		this.vertexSource = vertexFunc();
		/**
		 * (DO NOT USE) Internal variable to keep track of the fragment source for compilation.
		 * @readonly
		 */
		this.fragmentSource = fragmentFunc();
		/**
		 * (DO NOT USE) Internal variable for initilization of parts of the shaders (like uniforms).
		 * @readonly
		 */
		this.initFunc = shaderInitFunc;

		/**
		 * (DO NOT USE) Internal variable in which the shader is stored.
		 * @readonly
		 */
		this.id = this.createProgram(this.vertexSource, this.fragmentSource);
		/**
		 * (DO NOT USE) Internal variable for caching shader attributes, to minimize API calls.
		 * @readonly
		 */
		this.attribLocationCache = {};
		/**
		 * (DO NOT USE) Internal variable for caching shader uniforms, to minimize API calls.
		 * @readonly
		 */
		this.uniformLocationCache = {};
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.shader} instance.
	 * @readonly
	 */
	static init() {
		gl.getExtension('OES_standard_derivatives');
		shader = new Shader();
		shader.bind();
		shader.initFunc();
	}

	/**
	 * (DO NOT USE) Actual method for creating the shader program with compiled shaders.
	 * @readonly
	 * @param {string} vertexShaderSource - Argument for vertex shader to use.
	 * @param {string} fragmentShaderSource - Argument for fragment shader to use.
	 * @returns {WebGLProgram}
	 */
	createProgram(vertexShaderSource, fragmentShaderSource) {
		const program = gl.createProgram();
		const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.validateProgram(program);

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		return program;
	}

	/**
	 * (DO NOT USE) Method for compiling shaders.
	 * @readonly
	 * @param {number} type - The type of shader, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader#parameters}.
	 * @param {string} source - Shader source to use.
	 * @returns {WebGLShader}
	 */
	compileShader(type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
			console.error(gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	/**
	 * (DO NOT USE) Method for getting the location of attributes inside shaders.
	 * @readonly
	 * @param {string} name - Name of the attribute.
	 * @returns {number} ID of attribute inside shader.
	 */
	getAttribLocation(name) {
		if (this.attribLocationCache[name] === undefined) this.attribLocationCache[name] = gl.getAttribLocation(this.id, name);
		return this.attribLocationCache[name];
	}
	/**
	 * (DO NOT USE) Method for getting the location of uniforms inside shaders.
	 * @readonly
	 * @param {string} name - Name of the uniform.
	 * @returns {WebGLUniformLocation} Location of uniform inside shader.
	 */
	getUniformLocation(name) {
		if (this.uniformLocationCache[name] === undefined) this.uniformLocationCache[name] = gl.getUniformLocation(this.id, name);
		return this.uniformLocationCache[name];
	}
	/**
	 * (DO NOT USE) Method for setting a uniform inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats and "i" for integers, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {string} name - Name of the uniform.
	 * @param {Array} values - Array with values, length 1-4, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 */
	setUniform(type, name, values) { gl['uniform' + values.length + type](this.getUniformLocation(name), values[0], values[1], values[2], values[3]); }
	/**
	 * (DO NOT USE) Method for setting array uniforms inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats and "i" for integers, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {string} name - Name of the uniform.
	 * @param {Array} array - Array with values, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {number} elementAmount - Amount of elements in each element of the array, i.e. 2 for vec2, see [docs.gl]{@link https://docs.gl/es2/glUniform} and [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 */
	setUniformArray(type, name, array, elementAmount = 1) { gl['uniform' + elementAmount + type + 'v'](this.getUniformLocation(name), array); }
	/**
	 * (DO NOT USE) Method for setting matrix uniforms inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats only, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix}.
	 * @param {string} name - Name of the uniform.
	 * @param {HB.Mat4} matrix - Hummingbird matrix.
	 */
	setUniformMatrix(type, name, matrix) {
		const glMatrix = Mat4.toArray(matrix);
		gl['uniformMatrix' + Math.sqrt(glMatrix.length) + type + 'v'](this.getUniformLocation(name), false, glMatrix);
	}

	/**
	 * (DO NOT USE) Method to bind this shader program (set it as active).
	 * @readonly
	 */
	bind() { gl.useProgram(this.id); }
	/**
	 * (DO NOT USE) Method to bind an empty shader program (set this one as inactive).
	 * @readonly
	 */
	unbind() { gl.useProgram(null); }
	/**
	 * (DO NOT USE) Method to unbind and then delete this shader program, is called from {@link HB.Renderer#delete}.
	 * @readonly
	 */
	delete() {
		this.unbind();
		gl.deleteProgram(this.id);
	}
}

export {
	Shader,
	shader
};
