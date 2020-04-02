import { gl } from './common.js';

let shader = undefined;

class Shader{
	constructor(vertexShaderSource, fragmentShaderSource) {
		this.vertexShaderSource = vertexShaderSource || `#version 300 es
			in vec4 aVertexPosition;
			in vec4 aVertexColor;
			in vec2 aTexturePosition;
			in float aTextureId;
			in float aTextSize;

			out vec4 vVertexColor;
			out vec2 vTexturePosition;
			out float vTextureId;
			out float vTextSize;

			uniform mat4 uMVP;

			void main() {
				gl_Position = uMVP * aVertexPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
				vTextureId = aTextureId;
				vTextSize = aTextSize;
			}
		`, this.fragmentShaderSource = fragmentShaderSource || `#version 300 es
			precision mediump float;
			in vec4 vVertexColor;
			in vec2 vTexturePosition;
			in float vTextureId;
			in float vTextSize;

			uniform sampler2D uTextureIds[16];

			out vec4 pixelColor;

			void main() {
				vec4 texSample;
				switch(int(vTextureId)) {
					case 0: texSample = texture(uTextureIds[0], vTexturePosition); break;
					case 1: texSample = texture(uTextureIds[1], vTexturePosition); break;
					case 2: texSample = texture(uTextureIds[2], vTexturePosition); break;
					case 3: texSample = texture(uTextureIds[3], vTexturePosition); break;
					case 4: texSample = texture(uTextureIds[4], vTexturePosition); break;
					case 5: texSample = texture(uTextureIds[5], vTexturePosition); break;
					case 6: texSample = texture(uTextureIds[6], vTexturePosition); break;
					case 7: texSample = texture(uTextureIds[7], vTexturePosition); break;
					case 8: texSample = texture(uTextureIds[8], vTexturePosition); break;
					case 9: texSample = texture(uTextureIds[9], vTexturePosition); break;
					case 10: texSample = texture(uTextureIds[10], vTexturePosition); break;
					case 11: texSample = texture(uTextureIds[11], vTexturePosition); break;
					case 12: texSample = texture(uTextureIds[12], vTexturePosition); break;
					case 13: texSample = texture(uTextureIds[13], vTexturePosition); break;
					case 14: texSample = texture(uTextureIds[14], vTexturePosition); break;
					case 15: texSample = texture(uTextureIds[15], vTexturePosition); break;
				}
				if(vTextSize <= 0.0) {
					pixelColor = texSample * vVertexColor;
				} else {
					float sigDist = max(min(texSample.r, texSample.g), min(max(texSample.r, texSample.g), texSample.b)) - 0.5;
					float alpha = clamp(sigDist/fwidth(sigDist) + 0.4, 0.0, 1.0);
					pixelColor = vec4(vVertexColor.rgb, alpha * vVertexColor.a);
				}
			}
		`;

		this.id = this.createProgram(this.vertexShaderSource, this.fragmentShaderSource);
		this.attribLocationCache = {};
		this.uniformLocationCache = {};
	}

	static init() {
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
	setUniformMatrix(type, name, matrix) { gl['uniformMatrix'+Math.sqrt(matrix.length)+type+'v'](this.getUniformLocation(name), true, matrix); }

	bind() { gl.useProgram(this.id); }
	unbind() { gl.useProgram(null); }
	delete() {
		this.unbind();
		gl.deleteProgram(this.id);
	}
}

export { Shader, shader };