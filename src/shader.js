import { gl } from './common.js';
import { Mat4 } from './math.js';

let shader = undefined;

class Shader{
	constructor(vertexShaderSource, fragmentShaderSource) {
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
		`, this.fragmentShaderSource = fragmentShaderSource || `
			#extension GL_OES_standard_derivatives : enable

			precision mediump float;
			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextSize;

			uniform sampler2D uTextureIds[16];

			void main() {
				vec4 texSample;
				int textureId = int(vTextureId);
				for(int i = 0; i < 16; i++) {
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

		this.id = this.createProgram(this.vertexShaderSource, this.fragmentShaderSource);
		this.attribLocationCache = {};
		this.uniformLocationCache = {};
	}

	static init() {
		gl.getExtension('OES_standard_derivatives');
		shader = new Shader();
	}

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

	getAttribLocation(name) {
		if(this.attribLocationCache[name] === undefined) this.attribLocationCache[name] = gl.getAttribLocation(this.id, name);
		return this.attribLocationCache[name];
	}
	getUniformLocation(name) {
		if(this.uniformLocationCache[name] === undefined) this.uniformLocationCache[name] = gl.getUniformLocation(this.id, name);
		return this.uniformLocationCache[name];
	}
	setUniform(type, name, values) { gl['uniform'+values.length+type](this.getUniformLocation(name), values[0], values[1], values[2], values[3]); }
	setUniformArray(type, name, array, elementAmount = 1) { gl['uniform'+elementAmount+type+'v'](this.getUniformLocation(name), array); }
	setUniformMatrix(type, name, matrix) {
		const glMatrix = Mat4.toArray(matrix);
		gl['uniformMatrix'+Math.sqrt(glMatrix.length)+type+'v'](this.getUniformLocation(name), false, glMatrix);
	}

	bind() { gl.useProgram(this.id); }
	unbind() { gl.useProgram(null); }
	delete() {
		this.unbind();
		gl.deleteProgram(this.id);
	}
}

export { Shader, shader };