class Shader{
	constructor(vertexShaderSource, fragmentShaderSource) {
		this.id = this.createProgram(vertexShaderSource, fragmentShaderSource);
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
	setUniformMatrix(type, name, matrix) { gl['uniformMatrix'+Math.sqrt(matrix.length)+type+'v'](this.getUniformLocation(name), true, matrix); }

	bind() { gl.useProgram(this.id); }
	unbind() { gl.useProgram(null); }
	delete() {
		this.unbind();
		gl.deleteProgram(this.id);
	}
}