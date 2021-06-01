import { gl } from './common.js';
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
class Shader{
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @param {string} vertexShaderSource - Argument for optional vertex shader, unused in favor of [the default included shader]{@link https://projects.brandond.nl/Hummingbird/docs/shader.js.html}.
	 * @param {string} fragmentShaderSource - Argument for optional fragment shader, unused in favor of [the default included shader]{@link https://projects.brandond.nl/Hummingbird/docs/shader.js.html}.
	 * @param {string} textureUnits=8 - The amount of texture units available, set automatically.
	 * @memberof HB
	 */
	constructor(vertexShaderSource, fragmentShaderSource, textureUnits) {
		/**
		 * (DO NOT USE) Internal variable to keep track of the vertex source for compilation, [the default shader]{@link https://projects.brandond.nl/Hummingbird/docs/shader.js.html}.
		 * @readonly
		 */
		this.vertexShaderSource = vertexShaderSource || `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			attribute vec2 aTexturePosition;
			attribute float aTextureId;
			attribute float aTextSize;

			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextSize;

			uniform mat4 uMVP;

			void main() {
				vScreenPosition = uMVP * aVertexPosition;
				gl_Position = vScreenPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
				vTextureId = aTextureId;
				vTextSize = aTextSize;
			}
		`;
		/**
		 * (DO NOT USE) Internal variable to keep track of the fragment source for compilation, [the default shader]{@link https://projects.brandond.nl/Hummingbird/docs/shader.js.html}.
		 * @readonly
		 */
		this.fragmentShaderSource = fragmentShaderSource || `
			#extension GL_OES_standard_derivatives : enable

			precision mediump float;
			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextSize;

			uniform sampler2D uTextureIds[${textureUnits}];

			void main() {
				vec4 texSample;
				int textureId = int(vTextureId);
				for(int i = 0; i < ${textureUnits}; i++) {
					if(i == textureId) {
						texSample = texture2D(uTextureIds[i], vTexturePosition); break;
					}
				}
				if(vTextSize <= 0.0) {
					// float dist = distance(vec4(0.0, 0.0, 0.0, 1.0), vScreenPosition);
					// vec4 color = texSample * vVertexColor;
					// pixelColor = vec4(color.rgb, smoothstep(0.75, 0.5, dist)*color.a);
					gl_FragColor = vVertexColor * texSample;
				} else {
					float sigDist = max(min(texSample.r, texSample.g), min(max(texSample.r, texSample.g), texSample.b)) - 0.5;
					float alpha = clamp(sigDist/fwidth(sigDist) + 0.4, 0.0, 1.0);
					gl_FragColor = vec4(vVertexColor.rgb, alpha * vVertexColor.a);
				}
			}
		`;

		/**
		 * (DO NOT USE) Internal variable in which the shader is stored.
		 * @readonly
		 */
		this.id = this.createProgram(this.vertexShaderSource, this.fragmentShaderSource);
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
	 * @param {number} textureUnits=8 - The amount of available texture units.
	 * @readonly
	 */
	static init(textureUnits) {
		gl.getExtension('OES_standard_derivatives');
		shader = new Shader(undefined, undefined, textureUnits);
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

		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
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
		if(this.attribLocationCache[name] === undefined) this.attribLocationCache[name] = gl.getAttribLocation(this.id, name);
		return this.attribLocationCache[name];
	}
	/**
	 * (DO NOT USE) Method for getting the location of uniforms inside shaders.
	 * @readonly
	 * @param {string} name - Name of the uniform.
	 * @returns {WebGLUniformLocation} Location of uniform inside shader.
	 */
	getUniformLocation(name) {
		if(this.uniformLocationCache[name] === undefined) this.uniformLocationCache[name] = gl.getUniformLocation(this.id, name);
		return this.uniformLocationCache[name];
	}
	/**
	 * (DO NOT USE) Method for setting a uniform inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats and "i" for integers, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {string} name - Name of the uniform.
	 * @param {Array} values - Array with values, length 1-4, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 */
	setUniform(type, name, values) { gl['uniform'+values.length+type](this.getUniformLocation(name), values[0], values[1], values[2], values[3]); }
	/**
	 * (DO NOT USE) Method for setting array uniforms inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats and "i" for integers, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {string} name - Name of the uniform.
	 * @param {Array} array - Array with values, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 * @param {number} elementAmount - Amount of elements in each element of the array, i.e. 2 for vec2, see [docs.gl]{@link https://docs.gl/es2/glUniform} and [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform}.
	 */
	setUniformArray(type, name, array, elementAmount = 1) { gl['uniform'+elementAmount+type+'v'](this.getUniformLocation(name), array); }
	/**
	 * (DO NOT USE) Method for setting matrix uniforms inside shaders.
	 * @readonly
	 * @param {string} type - Type of value, "f" for floats only, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix}.
	 * @param {string} name - Name of the uniform.
	 * @param {HB.Mat4} matrix - Hummingbird matrix.
	 */
	setUniformMatrix(type, name, matrix) {
		const glMatrix = Mat4.toArray(matrix);
		gl['uniformMatrix'+Math.sqrt(glMatrix.length)+type+'v'](this.getUniformLocation(name), false, glMatrix);
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

export { Shader, shader };