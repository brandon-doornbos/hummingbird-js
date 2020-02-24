"use strict";

class Buffer{
	constructor(type, usage, data) {
		this.type = type;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, usage);
	}

	bind() { gl.bindBuffer(this.type, this.id); }
	unbind() { gl.bindBuffer(this.type, null); }
	delete() {
		this.unbind();
		gl.deleteBuffer(this.id);
	}
}

class VertexBuffer extends Buffer{
	constructor(data) {
		super(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(data));
	}
}

class IndexBuffer extends Buffer{
	constructor(data/*, count*/) {
		super(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, new Uint32Array(data));
		// this.count = count;
	}
}

class VertexArray{
	constructor(renderer) {
		this.id = gl.createVertexArray();
		gl.bindVertexArray(this.id);

		class Layout{
			constructor() {
				this.elements = [];
				this.stride = 0;
			}

			add(name, type, count, normalized = false) {
				const index = renderer.shader.getAttribLocation(name);
				if(index !== -1) this.elements.push({ index: index, type: type, count: count, normalized: normalized });
				this.stride += count*bytes(type);
				return index;
			}

			clear() {
				this.elements = [];
				this.stride = 0;
			}
		}
		this.layout = new Layout();
	}

	addBuffer(vertexBuffer) {
		this.bind();
		vertexBuffer.bind();

		let offset = 0;
		this.layout.elements.forEach((element) => {
			gl.enableVertexAttribArray(element.index);
			gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.layout.stride, offset);
			offset += element.count*bytes(element.type);
		});
	}

	bind() { gl.bindVertexArray(this.id); };
	unbind() { gl.bindVertexArray(null); };
	delete() {
		this.unbind();
		vertexArray.layout.elements.forEach((element) => gl.disableVertexAttribArray(element.index));
		gl.deleteVertexArray(this.id);
	}
}

window.addEventListener("load", HummingbirdSetup);
let HummingbirdCanvas, gl;
const Hummingbird = {
	version: "v0.0.30",
	noUpdate: false,
	toLoad: 0,
	loadTimeout: 5000,
	frames: 0,
	prevTime: 0,
	mouse: [0, 0],
	mouseIsPressed: false,
	renderer: undefined,
	textures: [],
};

function HummingbirdSetup() {
	console.log("Hummingbird "+Hummingbird.version+" by SantaClausNL. https://www.santaclausnl.ga/");

	if(typeof preload === 'function') {
		preload();
		const loading = document.createTextNode("LOADING...");
		document.body.appendChild(loading);
		if(Hummingbird.toLoad <= 0) Continue(); else {
			let elapsedLoading = 0;
			const loadingLoop = setInterval(() => {
				if(Hummingbird.toLoad <= 0 || elapsedLoading >= Hummingbird.loadTimeout) {
					if(elapsedLoading >= Hummingbird.loadTimeout) console.warn("Failed to load assets.");
					clearInterval(loadingLoop);
					loading.remove();
					Continue();
				} else elapsedLoading += 25;
			}, 25);
		}
	} else Continue();

	function Continue() {
		if(typeof setup === 'function') setup();
		if(typeof update === 'function' && Hummingbird.noUpdate !== true) requestAnimationFrame(HummingbirdUpdate);
	}
}

function init(width_, height_, options) {
	if(!defined(options)) options = {};
	if(options["noUpdate"] === true) Hummingbird.noUpdate = true;
	if(defined(options["canvas"])) {
		HummingbirdCanvas = options["canvas"], gl = HummingbirdCanvas.getContext('webgl2');
	} else {
		HummingbirdCanvas = document.createElement("CANVAS"), gl = HummingbirdCanvas.getContext('webgl2');
		if(defined(options["parent"])) options["parent"].appendChild(HummingbirdCanvas); else document.body.appendChild(HummingbirdCanvas);
	}
	if(gl === null) {
		HummingbirdCanvas.parentNode.removeChild(HummingbirdCanvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL2 is not supported on your browser or machine.';
		if(defined(options["parent"])) options["parent"].appendChild(p); else document.body.appendChild(p);
	} else {
		HummingbirdCanvas.width = width_ || 100, HummingbirdCanvas.height = height_ || 100;
		HummingbirdCanvas.id = defined(options["id"]) ? options["id"] : "HummingbirdCanvas";

		Hummingbird.renderer = new Renderer();
	}

	if(typeof keyPressed === 'function') window.addEventListener('keydown', (e) => { keyPressed(e); });
	if(typeof keyReleased === 'function') window.addEventListener('keyup', (e) => { keyReleased(e); });
	window.addEventListener('mousemove', (e) => { Hummingbird.mouse = getMousePos(e); if(typeof mouseMoved === 'function') mouseMoved(e); });
	window.addEventListener('mousedown', (e) => { Hummingbird.mouseIsPressed = true; if(typeof mousePressed === 'function') mousePressed(e); });
	window.addEventListener('mouseup', (e) => { Hummingbird.mouseIsPressed = false; if(typeof mouseReleased === 'function') mouseReleased(e); });
	window.addEventListener('beforeunload', () => {
		Hummingbird.textures.forEach((texture) => { texture.delete(); });
		Hummingbird.renderer.delete();
	});
}

function resizeWindow(width_, height_) {
	HummingbirdCanvas.width = width_, HummingbirdCanvas.height = height_;
	gl.viewport(0, 0, width_, height_);
	projectionMatrix = Mat4.orthographic(0, HummingbirdCanvas.width, 0, HummingbirdCanvas.heigh, -100, 100);
}

function HummingbirdUpdate(now) {
	const deltaTime = now-Hummingbird.prevTime;
	Hummingbird.prevTime = now;
	update(deltaTime);
	Hummingbird.frames++;
	requestAnimationFrame(HummingbirdUpdate);
}

class Meth{
	static radians(degrees) { return degrees*(Math.PI/180); }
	static degrees(radians) { return radians*(180/Math.PI); }
}

class Mat4{
	static new(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
		return [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
	}

	static identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }

	static orthographic(left, right, top, bottom, near = -1, far = 1) {
		return [
			2/(right-left),              0,             0, -((right+left)/(right-left)),
									 0, 2/(top-bottom),             0, -((top+bottom)/(top-bottom)),
									 0,              0, -2/(far-near),     -((far+near)/(far-near)),
									 0,              0,             0,                            1,
		];
	}

	// static perspective(aspectRatio, fieldOfView, near = 1, far = 100) {
	// 	return [
	// 		1/(aspectRatio*Math.tan(fieldOfView/2)),                         0,                        0,                          0,
	// 		                                      0, 1/Math.tan(fieldOfView/2),                        0,                          0,
	// 		                                      0,                         0, -((far+near)/(far-near)), -((2*far*near)/(far-near)),
	// 		                                      0,                         0,                       -1,                          0,
	// 	];
	// }
	// static perspective(left, right, top, bottom, near, far) {
	// 	return [
	// 		(2*near)/(right-left), 0, (right+left)/(right-left), 0,
	// 		0, (2*near)/(top-bottom), (top+bottom)/(top-bottom), 0,
	// 		0, 0, -(far+near)/(far-near), -(2*far*near)/(far-near),
	// 		0, 0, -1, 0,
	// 	];
	// }
	static perspective(fovy, aspect, near, far) {
		let f = 1/Math.tan(fovy/2), nf =  1/(near-far);
		return [f/aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far+near)*nf, -1, 0, 0, 2*far*near*nf, 0];
	}

	static multMat4(matrixA, matrixB) {
		const row1 = Vec4.multMat4([matrixB[ 0], matrixB[ 1], matrixB[ 2], matrixB[ 3]], matrixA);
		const row2 = Vec4.multMat4([matrixB[ 4], matrixB[ 5], matrixB[ 6], matrixB[ 7]], matrixA);
		const row3 = Vec4.multMat4([matrixB[ 8], matrixB[ 9], matrixB[10], matrixB[11]], matrixA);
		const row4 = Vec4.multMat4([matrixB[12], matrixB[13], matrixB[14], matrixB[15]], matrixA);

		return [row1[0], row1[1], row1[2], row1[3], row2[0], row2[1], row2[2], row2[3], row3[0], row3[1], row3[2], row3[3], row4[0], row4[1], row4[2], row4[3]];
	}

	static scale(matrix, vector) { return Mat4.multMat4(matrix, [vector[0], 0, 0, 0, 0, vector[1], 0, 0, 0, 0, vector[2], 0, 0, 0, 0, 1]); }
	static translate(matrix, vector) { return Mat4.multMat4(matrix, [1, 0, 0, vector[0], 0, 1, 0, vector[1], 0, 0, 1, vector[2], 0, 0, 0, 1]); }
	static rotateX(matrix, angle) { return Mat4.multMat4(matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateY(matrix, angle) { return Mat4.multMat4(matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateZ(matrix, angle) { return Mat4.multMat4(matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
}

class Vec2{
	static new(x, y) { return [x, y]; }
}

class Vec3{
	static new(x, y, z) { return [x, y, z]; }
}

class Vec4{
	static new(x, y, z, w) { return [x, y, z, w]; }

	static multVec4(vectorA, vectorB) { return [vectorA[0] * vectorB[0], vectorA[1] * vectorB[1], vectorA[2] * vectorB[2], vectorA[3] * vectorB[3]]; }

	static multMat4(vector, matrix) {
		return [
			(vector[0] * matrix[ 0]) + (vector[1] * matrix[ 4]) + (vector[2] * matrix[ 8]) + (vector[3] * matrix[12]),
			(vector[0] * matrix[ 1]) + (vector[1] * matrix[ 5]) + (vector[2] * matrix[ 9]) + (vector[3] * matrix[13]),
			(vector[0] * matrix[ 2]) + (vector[1] * matrix[ 6]) + (vector[2] * matrix[10]) + (vector[3] * matrix[14]),
			(vector[0] * matrix[ 3]) + (vector[1] * matrix[ 7]) + (vector[2] * matrix[11]) + (vector[3] * matrix[15])
		];
	}
}

class Renderer{
	constructor() {
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		this.shader = new Shader();
		this.shader.bind();

		this.vertexArray = new VertexArray(this);

		const vertices = [
			100, 100, 0, 0, 0, 1, 1, 0, 0, 1,
			200, 100, 0, 0, 0, 1, 1, 1, 0, 1,
			200, 200, 0, 0, 0, 1, 1, 1, 1, 1,
			100, 200, 0, 0, 0, 1, 1, 0, 1, 1,
		];
		this.vertexBuffer = new VertexBuffer(vertices);
		this.vertexArray.layout.add('aVertexPosition', gl.FLOAT, 3);
		this.vertexArray.layout.add('aVertexColor', gl.FLOAT, 4);
		this.vertexArray.layout.add('aTexturePosition', gl.FLOAT, 2);
		this.vertexArray.layout.add('aTextureId', gl.FLOAT, 1);
		this.vertexArray.addBuffer(this.vertexBuffer);

		const indices = [
			0, 1, 2,  2, 3, 0,
		];
		this.indexBuffer = new IndexBuffer(indices);

		{ // set a blank texture on slot 0
			const blankTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, blankTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}

		this.projectionMatrix = Mat4.orthographic(0, HummingbirdCanvas.width, 0, HummingbirdCanvas.height, -100, 100);
		// projectionMatrix = Mat4.perspective(c.width/c.height, 60*(Math.PI/180), 1, 100);
		// projectionMatrix = Mat4.perspective(0, c.width, 0, c.height, 1, 100);
		// projectionMatrix = [0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, -0.02020, -1.02020, 0, 0, 0, 1];
		// projectionMatrix = Mat4.perspective(60*(Math.PI/180), c.width/c.height, -1, -100);
		// console.log(projectionMatrix);
		this.viewMatrix = Mat4.identity();//Mat4.translate(Mat4.identity(), Vec3.new(0, 0, 0));
		this.modelMatrix = Mat4.identity();//Mat4.translate(Mat4.identity(), Vec3.new(0, 0, 0));
	}

	clear() { gl.clear(gl.COLOR_BUFFER_BIT); }

	draw(shader, vertexArray, indexCount) {
		shader.bind();
		vertexArray.bind();

		shader.setUniform('i', 'uTextureId', [1]);
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
	}

	delete() {
		this.shader.delete();
		this.vertexArray.delete();
		this.vertexBuffer.delete();
		this.indexBuffer.delete();
	}
}

class Shader{
	constructor(vertexShaderSource, fragmentShaderSource) {
		this.vertexShaderSource = vertexShaderSource || `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			attribute vec2 aTexturePosition;
			attribute float aTextureId;

			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;

			uniform mat4 uMVP;

			void main() {
				gl_Position = uMVP * aVertexPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
			}
		`, this.fragmentShaderSource = fragmentShaderSource || `
			precision mediump float;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;

			uniform sampler2D uTextureId;

			void main() {
				gl_FragColor = texture2D(uTextureId, vTexturePosition);// * vVertexColor;
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
	setUniformMatrix(type, name, matrix) { gl['uniformMatrix'+Math.sqrt(matrix.length)+type+'v'](this.getUniformLocation(name), true, matrix); }

	bind() { gl.useProgram(this.id); }
	unbind() { gl.useProgram(null); }
	delete() {
		this.unbind();
		gl.deleteProgram(this.id);
	}
}

class Texture{
	constructor(filePath) {
		this.id = 0;
		this.createTexture(filePath);
	}

	setErrorTexture() {
		this.bind();
		const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
		this.setTextureParameters(gl.NEAREST, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, errorTexture);
		// this.unbind();
	}

	createTexture(filePath) {
		this.id = gl.createTexture();

		this.setErrorTexture();
		if(!defined(filePath)) return;

		const image = new Image();
		image.onload = () => {
			// const canvas = document.createElement('canvas');
			// canvas.width = image.width, canvas.height = image.height;
			// const canvasContext = canvas.getContext('2d');
			// canvasContext.drawImage(image, 0, 0);
			// const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
			// const flippedImageData = new ImageData(imageData.width, imageData.height);
			// for(let i = 0; i < imageData.data.length; i += 4) {
			// 	flippedImageData.data[imageData.data.length-i-4] = imageData.data[i+0];
			// 	flippedImageData.data[imageData.data.length-i-3] = imageData.data[i+1];
			// 	flippedImageData.data[imageData.data.length-i-2] = imageData.data[i+2];
			// 	flippedImageData.data[imageData.data.length-i-1] = imageData.data[i+3];
			// }
			// // canvasContext.putImageData(newData, 0, 0);
			// // document.documentElement.appendChild(canvas);
			// canvas.remove();

			this.bind();
			this.setTextureParameters(gl.LINEAR, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
			// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
			// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, flippedImageData);
			// this.unbind();
		}
		image.src = filePath;
	}

	setTextureParameters(filter, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}

	bind(slot = 1) {
		gl.activeTexture(gl['TEXTURE' + slot]);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}
	unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
	delete() {
		this.unbind();
		gl.deleteTexture(this.id);
	}
}

// gives byte amount of different WebGL types
function bytes(type) {
	switch(type) {
		case gl.FLOAT: case gl.UNSIGNED_INT: return 4;
		case gl.BYTE: return 1;
	}
}
// returns true if passed variable is not undefined
function defined(variable) { return variable !== undefined; }
// get the mouse position in the form of a Vec2
function getMousePos(e) {
	const rect = HummingbirdCanvas.getBoundingClientRect(), root = document.body;
	return [e.clientX-rect.left-root.scrollLeft, e.clientY-rect.top-root.scrollTop];
}

