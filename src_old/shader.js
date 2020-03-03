class Shader{
	constructor(vertexShaderSource, fragmentShaderSource) {
		this.vertexShaderSource = vertexShaderSource || `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			attribute vec2 aTexturePosition;
			attribute float aTextureId;

			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;

			uniform mat4 uMVP;

			void main() {
				gl_Position = uMVP * aVertexPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
				vTextureId = aTextureId;
			}
		`, this.fragmentShaderSource = fragmentShaderSource || `
			precision mediump float;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;

			uniform sampler2D uTextureIds[16];

			void main() {
				for(int i = 0; i < 16; i++) {
					if(i == int(vTextureId)) {
						gl_FragColor = texture2D(uTextureIds[i], vTexturePosition) * vVertexColor;
						break;
					}
				}
			}
		`;

		this.id = this.createProgram(this.vertexShaderSource, this.fragmentShaderSource);
		this.attribLocationCache = {};
		this.uniformLocationCache = {};
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