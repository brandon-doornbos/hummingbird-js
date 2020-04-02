var HB = (function (exports) {
	'use strict';

	exports.shader = undefined;

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
			exports.shader = new Shader();
		}

		createProgram(vertexShaderSource, fragmentShaderSource) {
			const program = exports.gl.createProgram();
			const vertexShader = this.compileShader(exports.gl.VERTEX_SHADER, vertexShaderSource);
			const fragmentShader = this.compileShader(exports.gl.FRAGMENT_SHADER, fragmentShaderSource);
		
			exports.gl.attachShader(program, vertexShader);
			exports.gl.attachShader(program, fragmentShader);
			exports.gl.linkProgram(program);
			exports.gl.validateProgram(program);
		
			exports.gl.deleteShader(vertexShader);
			exports.gl.deleteShader(fragmentShader);

			return program;
		}

		compileShader(type, source) {
			const shader = exports.gl.createShader(type);
			exports.gl.shaderSource(shader, source);
			exports.gl.compileShader(shader);

			if(exports.gl.getShaderParameter(shader, exports.gl.COMPILE_STATUS) === false) {
				console.error(exports.gl.getShaderInfoLog(shader));
				exports.gl.deleteShader(shader);
				return null;
			}

			return shader;
		}

		getAttribLocation(name) {
			if(this.attribLocationCache[name] === undefined) this.attribLocationCache[name] = exports.gl.getAttribLocation(this.id, name);
			return this.attribLocationCache[name];
		}
		getUniformLocation(name) {
			if(this.uniformLocationCache[name] === undefined) this.uniformLocationCache[name] = exports.gl.getUniformLocation(this.id, name);
			return this.uniformLocationCache[name];
		}
		setUniform(type, name, values) { exports.gl['uniform'+values.length+type](this.getUniformLocation(name), values[0], values[1], values[2], values[3]); }
		setUniformArray(type, name, array, elementAmount = 1) { exports.gl['uniform'+elementAmount+type+'v'](this.getUniformLocation(name), array); }
		setUniformMatrix(type, name, matrix) { exports.gl['uniformMatrix'+Math.sqrt(matrix.length)+type+'v'](this.getUniformLocation(name), true, matrix); }

		bind() { exports.gl.useProgram(this.id); }
		unbind() { exports.gl.useProgram(null); }
		delete() {
			this.unbind();
			exports.gl.deleteProgram(this.id);
		}
	}

	class HBMath{
		constructor() {
			new Vec2();
			new Vec3();
			new Vec4();
		}

		static radians(degrees) { // convert degrees to radians
			return degrees*(Math.PI/180);
		}
		static degrees(radians) { // convert radians to degrees
			return radians*(180/Math.PI);
		}
		static map(value, valLow, valHigh, resLow, resHigh) { // map a number to another range
			return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow);
		}
		static random(low, high) { // a random float between 2 numbers
			if(high !== undefined) {
				return Math.random() * (high-low) + low;
			} else if(low !== undefined) {
				return Math.random() * low;
			} else {
				return Math.random();
			}
		}
		static randomInt(low, high) { // a random integer between 2 numbers
			return Math.floor(this.random(low, high));
		}
		static lerp(start, end, amt) { // linear interpolation
			return start+amt*(end-start);
		}
		static constrain(value, min, max) { // constrain a value
			if(value > max) {
				return max;
			} else if(value < min) {
				return min;
			} else {
				return value;
			}
		}
		static wrap(value, min, max) { // wrap a value if it is too high or low
			if(value > max) {
				return min;
			} else if(value < min) {
				return max;
			} else {
				return value;
			}
		}
		static rectRectCollision(vectorA, sizeA, vectorB, sizeB) { // check for AABB collision between two rectangles
			return (Math.abs((vectorA[0]+sizeA[0]/2) - (vectorB[0]+sizeB[0]/2)) * 2 < (sizeA[0] + sizeB[0]))
					&& (Math.abs((vectorA[1]+sizeA[1]/2) - (vectorB[1]+sizeB[1]/2)) * 2 < (sizeA[1] + sizeB[1]));
		}
	}

	// Perlin Noise class, create 1 instance and get values via noise.value(x); function
	class Noise{
		constructor(amp_ = 1, scl_ = 0.05) {
			this.vertices = 256, this.amp = amp_, this.scl = scl_, this.r = [];
			for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
		}

		value(x) {
			const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
			const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
			return HBMath.lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
		}
	}

	class Vec2{
		constructor() {
			Vec2.zero = [0, 0];
			Vec2.one = [1, 1];
		}

		static new(x = 0, y = 0) { return [x, y]; }
		static fromVec2(vector) { return [vector[0], vector[1]]; }
		static fromAngle(angle, radius = 1) { return this.new(Math.cos(angle) * radius, Math.sin(angle) * radius); }
		static copy(out, vector) { out[0] = vector[0], out[1] = vector[1]; }
		static set(out, x, y) { out[0] = x, out[1] = y; }

		static add(out, x, y) { out[0] += x, out[1] += y; }
		static addVec2(out, vector) { out[0] += vector[0], out[1] += vector[1]; }
		static addScalar(out, scalar) { out[0] += scalar, out[1] += scalar; }

		static subtract(out, x, y) { out[0] -= x, out[1] -= y; }
		static subtractVec2(out, vector) { out[0] -= vector[0], out[1] -= vector[1]; }
		static subtractScalar(out, scalar) { out[0] -= scalar, out[1] -= scalar; }

		static multiply(out, x, y) { out[0] *= x, out[1] *= y; }
		static multiplyVec2(out, vector) { out[0] *= vector[0], out[1] *= vector[1]; }
		static multiplyScalar(out, scalar) { out[0] *= scalar, out[1] *= scalar; }

		static divide(out, x, y) { out[0] /= x, out[1] /= y; }
		static divideVec2(out, vector) { out[0] /= vector[0], out[1] /= vector[1]; }
		static divideScalar(out, scalar) { out[0] /= scalar, out[1] /= scalar; }

		static constrain(out, lowX, hiX, lowY, hiY) {
			out[0] = HBMath.constrain(out[0], lowX, hiX);
			out[1] = HBMath.constrain(out[1], lowY, hiY);
		}

		static angleBetweenVec2(vectorA, vectorB) {
			return Math.atan2(vectorB[1] - vectorA[1], vectorB[0] - vectorA[0]);
		}

		static distBetweenVec2(vectorA, vectorB) {
			return Math.sqrt((vectorB[0]-vectorA[0])*(vectorB[0]-vectorA[0]) + (vectorB[1]-vectorA[1])*(vectorB[1]-vectorA[1]));
		}

		static collidesRect(vector, rectPos, rectSize) {
			return (
					 vector[0] < rectPos[0]+rectSize[0]
				&& vector[0] > rectPos[0]
				&& vector[1] < rectPos[1]+rectSize[1]
				&& vector[1] > rectPos[1]
			);
		}
	}

	class Vec3{
		constructor() {
			Vec3.zero = [0, 0, 0];
			Vec3.one = [1, 1, 1];
		}

		static new(x = 0, y = 0, z = 0) { return [x, y, z]; }
	}

	class Vec4{
		constructor() {
			Vec4.zero = [0, 0, 0, 0];
			Vec4.one = [1, 1, 1, 1];

			Vec4.colors = {};
			Vec4.colors['white'] = [1, 1, 1, 1];
			Vec4.colors['black'] = [0, 0, 0, 1];
			Vec4.colors['red'] = [1, 0, 0, 1];
			Vec4.colors['green'] = [0, 1, 0, 1];
			Vec4.colors['blue'] = [0, 0, 1, 1];
			Vec4.colors['yellow'] = [1, 1, 0, 1];
			Vec4.colors['cyan'] = [0, 1, 1, 1];
			Vec4.colors['magenta'] = [1, 0, 1, 1];
		}

		static new(x = 0, y = 0, z = 0, w = 0) { return [x, y, z, w]; }

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

	class Mat4{
		static new(identity = 0) { return [identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity]; }

		static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
			const rl = right-left, tb = top-bottom, fn = far-near;

			out[0 ] = 2/rl, out[1 ] =    0, out[2 ] =     0, out[3 ] = -(right+left)/rl;
			out[4 ] =    0, out[5 ] = 2/tb, out[6 ] =     0, out[7 ] = -(top+bottom)/tb;
			out[8 ] =    0, out[9 ] =    0, out[10] = -2/fn, out[11] =   -(far+near)/fn;
			out[12] =    0, out[13] =    0, out[14] =     0, out[15] =                1;
		}

		// static perspective(out, FoV, aspect, near = 0.01, far = 1000) {
		// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * FoV);
		// 	const invRange = 1.0 / (near - far);

		// 	out[0] = f/aspect, out[4] = 0, out[ 8] =                   0, out[12] =  0;
		// 	out[1] =        0, out[5] = f, out[ 9] =                   0, out[13] =  0;
		// 	out[2] =        0, out[6] = 0, out[10] = (near+far)*invRange, out[14] = -1;
		// 	out[3] =        0, out[7] = 0, out[11] = near*far*invRange*2, out[15] =  0;
		// }

		static multMat4(out, matrixA, matrixB) {
			const row0 = Vec4.multMat4([matrixB[ 0], matrixB[ 1], matrixB[ 2], matrixB[ 3]], matrixA);
			const row1 = Vec4.multMat4([matrixB[ 4], matrixB[ 5], matrixB[ 6], matrixB[ 7]], matrixA);
			const row2 = Vec4.multMat4([matrixB[ 8], matrixB[ 9], matrixB[10], matrixB[11]], matrixA);
			const row3 = Vec4.multMat4([matrixB[12], matrixB[13], matrixB[14], matrixB[15]], matrixA);

			out[0 ] = row0[0], out[1 ] = row0[1], out[2 ] = row0[2], out[3 ] = row0[3];
			out[4 ] = row1[0], out[5 ] = row1[1], out[6 ] = row1[2], out[7 ] = row1[3];
			out[8 ] = row2[0], out[9 ] = row2[1], out[10] = row2[2], out[11] = row2[3];
			out[12] = row3[0], out[13] = row3[1], out[14] = row3[2], out[15] = row3[3];
		}

		static scale(out, matrix, scale) { this.multMat4(out, matrix, [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1]); }
		static translate(out, matrix, vector3) { this.multMat4(out, matrix, [1, 0, 0, vector3[0], 0, 1, 0, vector3[1], 0, 0, 1, vector3[2], 0, 0, 0, 1]); }
		static rotate(out, matrix, up, angle) {
			const x = up[0] * Math.sin(angle/2);
			const y = up[1] * Math.sin(angle/2);
			const z = up[2] * Math.sin(angle/2);
			const w = Math.cos(angle/2);

			const x2 = x + x, y2 = y + y, z2 = z + z;

			const xx = x * x2;
			const yx = y * x2, yy = y * y2;
			const zx = z * x2, zy = z * y2, zz = z * z2;
			const wx = w * x2, wy = w * y2, wz = w * z2;

			this.multMat4(out, matrix, [1-yy-zz, yx+wz, zx-wy, 0, yx-wz, 1-xx-zz, zy+wx, 0, zx+wy, zy+wx, 1-xx-yy, 0, 0, 0, 0, 1]);
		}
		static rotateX(out, matrix, angle) { this.multMat4(out, matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
		static rotateY(out, matrix, angle) { this.multMat4(out, matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
		static rotateZ(out, matrix, angle) { this.multMat4(out, matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
	}

	exports.camera = undefined;

	class Camera{
		constructor() {
			exports.gl.viewport(0, 0, exports.canvas.width, exports.canvas.height);

			this.projectionMatrix = Mat4.new(1);
			Mat4.orthographic(this.projectionMatrix, 0, exports.canvas.width, 0, exports.canvas.height, -1, 1);
			// Mat4.perspective(this.projectionMatrix, Math.radians(60));
			this.viewMatrix = Mat4.new(1);
			// Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(0, 0, -400));
			this.modelMatrix = Mat4.new(1);
			// Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
		}

		static init() {
			exports.camera = new Camera();
		}

		setMVP(mvp = undefined) {
			if(mvp === undefined) {
				const modelView = Mat4.new(1);
				Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
				mvp = Mat4.new(1);
				Mat4.multMat4(mvp, modelView, this.projectionMatrix);
			}
			exports.shader.bind();
			exports.shader.setUniformMatrix('f', 'uMVP', mvp);
			// shader.setUniformMatrix('f', 'uMVP', this.projectionMatrix);
		}

		translate(vector3) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
	}

	// gives byte amount of different WebGL types
	function bytes(type) {
		switch(type) {
			case exports.gl.FLOAT: case exports.gl.UNSIGNED_INT: return 4;
			case exports.gl.BYTE: return 1;
		}
	}
	// load a file, give type(from link below) and supply callback that takes 1 i.e. data argument loadFile('path_to.file', (data) => console.log(data));
	// https://developer.mozilla.org/en-US/docs/Web/API/Body#Methods
	function loadFile(path, type, callback) {
		let returnValue = {data: "", path};

		const options = {method: 'GET'};
		fetch(path, options).then((res) => {
			return res[type]();
		}).then((data) => {
			callback(data);
		}).catch();

		return returnValue;
	}

	exports.vertexArray = undefined;
	exports.vertexStride = undefined;
	exports.vertexBuffer = undefined;
	exports.vertices = undefined;
	exports.indexBuffer = undefined;
	exports.indices = undefined;

	class VertexBuffer{
		constructor(data) {
			this.type = exports.gl.ARRAY_BUFFER;
			this.id = exports.gl.createBuffer();
			this.bind();
			exports.gl.bufferData(this.type, data, exports.gl.DYNAMIC_DRAW);
		}

		static init() {
			exports.vertices = new Float32Array(maxVertexCount*exports.vertexStride);
			exports.vertexBuffer = new VertexBuffer(exports.vertices);
		}

		write(data) { exports.gl.bufferSubData(this.type, 0, data); }
		partialWrite(data, length) { exports.gl.bufferSubData(this.type, 0, data, 0, length); }

		bind() { exports.gl.bindBuffer(this.type, this.id); }
		unbind() { exports.gl.bindBuffer(this.type, null); }
		delete() {
			this.unbind();
			exports.gl.deleteBuffer(this.id);
		}
	}

	class IndexBuffer{
		constructor(data) {
			this.type = exports.gl.ELEMENT_ARRAY_BUFFER;
			this.id = exports.gl.createBuffer();
			this.bind();
			exports.gl.bufferData(this.type, data, exports.gl.DYNAMIC_DRAW);
		}

		static init() {
			exports.indices = new Uint32Array(maxIndexCount);
			exports.indexBuffer = new IndexBuffer(exports.indices);
		}

		write(data) { exports.gl.bufferSubData(this.type, 0, data); }
		partialWrite(data, length) { exports.gl.bufferSubData(this.type, 0, data, 0, length); }

		bind() { exports.gl.bindBuffer(this.type, this.id); }
		unbind() { exports.gl.bindBuffer(this.type, null); }
		delete() {
			this.unbind();
			exports.gl.deleteBuffer(this.id);
		}
	}

	class VertexArray{
		constructor() {
			this.id = exports.gl.createVertexArray();
			exports.gl.bindVertexArray(this.id);

			class Layout{
				constructor() {
					this.elements = [];
					this.stride = 0;
					exports.vertexStride = 0;
				}

				add(name, type, count, normalized = false) {
					exports.vertexStride += count;
					const index = exports.shader.getAttribLocation(name);
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

		static init() {
			exports.vertexArray = new VertexArray();
			exports.vertexArray.layout.add('aVertexPosition', exports.gl.FLOAT, 3);
			exports.vertexArray.layout.add('aVertexColor', exports.gl.FLOAT, 4);
			exports.vertexArray.layout.add('aTexturePosition', exports.gl.FLOAT, 2);
			exports.vertexArray.layout.add('aTextureId', exports.gl.FLOAT, 1);
			exports.vertexArray.layout.add('aTextSize', exports.gl.FLOAT, 1);

			VertexBuffer.init();
			exports.vertexArray.addBuffer(exports.vertexBuffer);

			IndexBuffer.init();
		}

		addBuffer(vertexBuffer) {
			this.bind();
			vertexBuffer.bind();

			let offset = 0;
			this.layout.elements.forEach((element) => {
				exports.gl.enableVertexAttribArray(element.index);
				exports.gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.layout.stride, offset);
				offset += element.count*bytes(element.type);
			});
		}

		bind() { exports.gl.bindVertexArray(this.id); };
		unbind() { exports.gl.bindVertexArray(null); };
		delete() {
			this.unbind();
			exports.vertexArray.layout.elements.forEach((element) => exports.gl.disableVertexAttribArray(element.index));
			exports.gl.deleteVertexArray(this.id);
		}
	}

	const textures = {};
	exports.fontData = undefined;
	exports.font = undefined;

	class Texture{
		constructor(name, path, out = textures, callback = function() { console.log("Texture loaded: "+this.name); }) {
			this.id = exports.gl.createTexture();
			this.createTexture(path);
			this.name = name;

			if(out === undefined) {
				textures[this.name] = this;
			} else if(Array.isArray(out)) {
				out.push(this);
			} else if(out instanceof Object) {
				out[this.name] = this;
			}

			this.onLoadCallback = callback;
		}

		static init(loadElement) {
			loadFile("https://projects.santaclausnl.ga/Hummingbird/assets/arial.json", 'json', (data) => {
				exports.fontData = data;
				loadElement.remove();
				if(typeof HBupdate === 'function' && exports.noUpdate === false) requestAnimationFrame(HBupdate);
			});
			const webp = new Image();
			webp.onload = webp.onerror = () => exports.font = new Texture('Hummingbird_Font-Atlas', "https://projects.santaclausnl.ga/Hummingbird/assets/arial."+(webp.height === 2 ? 'webp' : 'png'), null);
			webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

			// const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
			const textureSamplers = [];
			for(let i = 0; i < 16; i++) { textureSamplers[i] = i; }
			exports.shader.setUniformArray('i', 'uTextureIds', textureSamplers);

			{ // set a blank texture on texture slot 0
				const blankTexture = exports.gl.createTexture();
				exports.gl.activeTexture(exports.gl.TEXTURE0);
				exports.gl.bindTexture(exports.gl.TEXTURE_2D, blankTexture);
				exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_MIN_FILTER, exports.gl.NEAREST);
				exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_MAG_FILTER, exports.gl.NEAREST);
				exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_S, exports.gl.REPEAT);
				exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_T, exports.gl.REPEAT);
				exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA8, 1, 1, 0, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
			}
		}

		setErrorTexture() {
			const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
			this.setTextureParameters(exports.gl.NEAREST, exports.gl.REPEAT);
			exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA8, 2, 2, 0, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, errorTexture);
		}

		createTexture(path) {
			this.bind();
			this.setErrorTexture();

			if(path === undefined) return;

			const image = new Image();
			image.onload = () => {
				this.bind();
				this.setTextureParameters(exports.gl.LINEAR, exports.gl.CLAMP_TO_EDGE);
				exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA8, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, image);
				this.onLoadCallback();
				// this.unbind();
			};
			image.src = path;
		}

		setTextureParameters(filter, wrap) {
			exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_MIN_FILTER, filter);
			exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_MAG_FILTER, filter);
			exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_S, wrap);
			exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_T, wrap);
		}

		bind(slot = 1) {
			exports.gl.activeTexture(exports.gl['TEXTURE' + slot]);
			exports.gl.bindTexture(exports.gl.TEXTURE_2D, this.id);
		}
		unbind() { exports.gl.bindTexture(exports.gl.TEXTURE_2D, null); }
		delete() {
			this.unbind();
			exports.gl.deleteTexture(this.id);
		}
	}

	exports.batch = undefined;
	const maxVertexCount = 2000;
	const maxIndexCount = 3000;

	class Batch{
		constructor() {
			this.vertexCount = 0;
			this.indexCount = 0;
			this.textureIndex = 1;
			this.textureCache = {};
		}

		static init() {
			exports.batch = new Batch();
		}

		begin() { this.reset(); }
		end() { this.flush(); }

		reset() {
			this.vertexCount = 0;
			this.indexCount = 0;
			this.textureIndex = 1;
			this.textureCache = {};
		}

		// drawColoredPolygon(points, color) {
		// 	const triangles = Math.floor(points.length/3);
		// 	for(let i = 0; i < triangles*3; i += 3) drawColoredTriangle(i);
		// 	if(points.length%3 > 0) drawColoredTriangle(points.length-3);

		// 	function drawColoredTriangle(startIndex) {
		// 		if((batch.vertexCount + 3) >= maxVertexCount || (batch.indexCount + 3) >= maxIndexCount) batch.flush();

		// 		const start = batch.vertexCount*vertexStride;
		// 		vertices[start   ] = points[startIndex][0];
		// 		vertices[start+1 ] = points[startIndex][1];
		// 		vertices[start+2 ] = 0;
		// 		vertices[start+3 ] = color[0];
		// 		vertices[start+4 ] = color[1];
		// 		vertices[start+5 ] = color[2];
		// 		vertices[start+6 ] = color[3];
		// 		vertices[start+7 ] = 0;
		// 		vertices[start+8 ] = 1;
		// 		vertices[start+9 ] = 0;
		// 		vertices[start+10] = 0;
		// 		vertices[start+11] = points[startIndex+1][0];
		// 		vertices[start+12] = points[startIndex+1][1];
		// 		vertices[start+13] = 0;
		// 		vertices[start+14] = color[0];
		// 		vertices[start+15] = color[1];
		// 		vertices[start+16] = color[2];
		// 		vertices[start+17] = color[3];
		// 		vertices[start+18] = 0.5;
		// 		vertices[start+19] = 0.5;
		// 		vertices[start+20] = 0;
		// 		vertices[start+21] = 0;
		// 		vertices[start+22] = points[startIndex+2][0];
		// 		vertices[start+23] = points[startIndex+2][1];
		// 		vertices[start+24] = 0;
		// 		vertices[start+25] = color[0];
		// 		vertices[start+26] = color[1];
		// 		vertices[start+27] = color[2];
		// 		vertices[start+28] = color[3];
		// 		vertices[start+29] = 1;
		// 		vertices[start+30] = 1;
		// 		vertices[start+31] = 0;
		// 		vertices[start+32] = 0;

		// 		indices[batch.indexCount  ] = batch.vertexCount;
		// 		indices[batch.indexCount+1] = batch.vertexCount+1;
		// 		indices[batch.indexCount+2] = batch.vertexCount+2;

		// 		batch.vertexCount += 3, batch.indexCount += 3;
		// 	}
		// }

		drawColoredRect(pos, size, color) {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			const start = this.vertexCount*exports.vertexStride;
			exports.vertices[start   ] = pos[0];
			exports.vertices[start+1 ] = pos[1];
			exports.vertices[start+2 ] = 0;
			exports.vertices[start+3 ] = color[0];
			exports.vertices[start+4 ] = color[1];
			exports.vertices[start+5 ] = color[2];
			exports.vertices[start+6 ] = color[3];
			exports.vertices[start+7 ] = 0;
			exports.vertices[start+8 ] = 0;
			exports.vertices[start+9 ] = 0;
			exports.vertices[start+10] = 0;
			exports.vertices[start+11] = pos[0]+size[0];
			exports.vertices[start+12] = pos[1];
			exports.vertices[start+13] = 0;
			exports.vertices[start+14] = color[0];
			exports.vertices[start+15] = color[1];
			exports.vertices[start+16] = color[2];
			exports.vertices[start+17] = color[3];
			exports.vertices[start+18] = 1;
			exports.vertices[start+19] = 0;
			exports.vertices[start+20] = 0;
			exports.vertices[start+21] = 0;
			exports.vertices[start+22] = pos[0]+size[0];
			exports.vertices[start+23] = pos[1]+size[1];
			exports.vertices[start+24] = 0;
			exports.vertices[start+25] = color[0];
			exports.vertices[start+26] = color[1];
			exports.vertices[start+27] = color[2];
			exports.vertices[start+28] = color[3];
			exports.vertices[start+29] = 1;
			exports.vertices[start+30] = 1;
			exports.vertices[start+31] = 0;
			exports.vertices[start+32] = 0;
			exports.vertices[start+33] = pos[0];
			exports.vertices[start+34] = pos[1]+size[1];
			exports.vertices[start+35] = 0;
			exports.vertices[start+36] = color[0];
			exports.vertices[start+37] = color[1];
			exports.vertices[start+38] = color[2];
			exports.vertices[start+39] = color[3];
			exports.vertices[start+40] = 0;
			exports.vertices[start+41] = 1;
			exports.vertices[start+42] = 0;
			exports.vertices[start+43] = 0;

			exports.indices[this.indexCount  ] = this.vertexCount;
			exports.indices[this.indexCount+1] = this.vertexCount+1;
			exports.indices[this.indexCount+2] = this.vertexCount+2;
			exports.indices[this.indexCount+3] = this.vertexCount+2;
			exports.indices[this.indexCount+4] = this.vertexCount+3;
			exports.indices[this.indexCount+5] = this.vertexCount;

			this.vertexCount += 4, this.indexCount += 6;
		}

		drawTexturedRect(pos, size, texture) {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			let textureIndex = this.textureCache[texture.name];
			if(textureIndex === undefined) {
				if((this.textureIndex + 1) >= 16) this.flush();
				this.textureCache[texture.name] = textureIndex = this.textureIndex;
				texture.bind(this.textureIndex++);
			}

			const start = this.vertexCount*exports.vertexStride;
			exports.vertices[start   ] = pos[0];
			exports.vertices[start+1 ] = pos[1];
			exports.vertices[start+2 ] = 0;
			exports.vertices[start+3 ] = 1;
			exports.vertices[start+4 ] = 1;
			exports.vertices[start+5 ] = 1;
			exports.vertices[start+6 ] = 1;
			exports.vertices[start+7 ] = 0;
			exports.vertices[start+8 ] = 0;
			exports.vertices[start+9 ] = textureIndex;
			exports.vertices[start+10] = 0;
			exports.vertices[start+11] = pos[0]+size[0];
			exports.vertices[start+12] = pos[1];
			exports.vertices[start+13] = 0;
			exports.vertices[start+14] = 1;
			exports.vertices[start+15] = 1;
			exports.vertices[start+16] = 1;
			exports.vertices[start+17] = 1;
			exports.vertices[start+18] = 1;
			exports.vertices[start+19] = 0;
			exports.vertices[start+20] = textureIndex;
			exports.vertices[start+21] = 0;
			exports.vertices[start+22] = pos[0]+size[0];
			exports.vertices[start+23] = pos[1]+size[1];
			exports.vertices[start+24] = 0;
			exports.vertices[start+25] = 1;
			exports.vertices[start+26] = 1;
			exports.vertices[start+27] = 1;
			exports.vertices[start+28] = 1;
			exports.vertices[start+29] = 1;
			exports.vertices[start+30] = 1;
			exports.vertices[start+31] = textureIndex;
			exports.vertices[start+32] = 0;
			exports.vertices[start+33] = pos[0];
			exports.vertices[start+34] = pos[1]+size[1];
			exports.vertices[start+35] = 0;
			exports.vertices[start+36] = 1;
			exports.vertices[start+37] = 1;
			exports.vertices[start+38] = 1;
			exports.vertices[start+39] = 1;
			exports.vertices[start+40] = 0;
			exports.vertices[start+41] = 1;
			exports.vertices[start+42] = textureIndex;
			exports.vertices[start+43] = 0;

			exports.indices[this.indexCount  ] = this.vertexCount;
			exports.indices[this.indexCount+1] = this.vertexCount+1;
			exports.indices[this.indexCount+2] = this.vertexCount+2;
			exports.indices[this.indexCount+3] = this.vertexCount+2;
			exports.indices[this.indexCount+4] = this.vertexCount+3;
			exports.indices[this.indexCount+5] = this.vertexCount;

			this.vertexCount += 4, this.indexCount += 6;
		}

		drawColoredLine(vectorA, vectorB, thickness, color) {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
			const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
			const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

			const start = this.vertexCount*exports.vertexStride;
			exports.vertices[start   ] = vectorA[0]-angleA[0];
			exports.vertices[start+1 ] = vectorA[1]-angleA[1];
			exports.vertices[start+2 ] = 0;
			exports.vertices[start+3 ] = color[0];
			exports.vertices[start+4 ] = color[1];
			exports.vertices[start+5 ] = color[2];
			exports.vertices[start+6 ] = color[3];
			exports.vertices[start+7 ] = 0;
			exports.vertices[start+8 ] = 0;
			exports.vertices[start+9 ] = 0;
			exports.vertices[start+10] = 0;
			exports.vertices[start+11] = vectorA[0]+angleA[0];
			exports.vertices[start+12] = vectorA[1]+angleA[1];
			exports.vertices[start+13] = 0;
			exports.vertices[start+14] = color[0];
			exports.vertices[start+15] = color[1];
			exports.vertices[start+16] = color[2];
			exports.vertices[start+17] = color[3];
			exports.vertices[start+18] = 1;
			exports.vertices[start+19] = 0;
			exports.vertices[start+20] = 0;
			exports.vertices[start+21] = 0;
			exports.vertices[start+22] = vectorB[0]-angleB[0];
			exports.vertices[start+23] = vectorB[1]-angleB[1];
			exports.vertices[start+24] = 0;
			exports.vertices[start+25] = color[0];
			exports.vertices[start+26] = color[1];
			exports.vertices[start+27] = color[2];
			exports.vertices[start+28] = color[3];
			exports.vertices[start+29] = 1;
			exports.vertices[start+30] = 1;
			exports.vertices[start+31] = 0;
			exports.vertices[start+32] = 0;
			exports.vertices[start+33] = vectorB[0]+angleB[0];
			exports.vertices[start+34] = vectorB[1]+angleB[1];
			exports.vertices[start+35] = 0;
			exports.vertices[start+36] = color[0];
			exports.vertices[start+37] = color[1];
			exports.vertices[start+38] = color[2];
			exports.vertices[start+39] = color[3];
			exports.vertices[start+40] = 0;
			exports.vertices[start+41] = 1;
			exports.vertices[start+42] = 0;
			exports.vertices[start+43] = 0;

			exports.indices[this.indexCount  ] = this.vertexCount;
			exports.indices[this.indexCount+1] = this.vertexCount+1;
			exports.indices[this.indexCount+2] = this.vertexCount+2;
			exports.indices[this.indexCount+3] = this.vertexCount+2;
			exports.indices[this.indexCount+4] = this.vertexCount+3;
			exports.indices[this.indexCount+5] = this.vertexCount;

			this.vertexCount += 4, this.indexCount += 6;
		}

		drawColoredText(string, pos, size = 12, align = 'start-start', color) {
			let textureIndex = this.textureCache[exports.font.name];
			if(textureIndex === undefined) {
				if((this.textureIndex + 1) >= 16) this.flush();
				this.textureCache[exports.font.name] = textureIndex = this.textureIndex;
				exports.font.bind(this.textureIndex++);
			}

			const glyphs = [], kernings = {};
			size = size/exports.fontData.info.size;
			let width = 0;
			const height = exports.fontData.info.size*size;

			let prevGlyphId;
			for(const char of string) {
				for(const glyph of Object.values(exports.fontData.chars)) {
					if(glyph.char === char) {
						if(prevGlyphId !== undefined) {
							for(const kerning of Object.values(exports.fontData.kernings)) {
								if(kerning[0] === prevGlyphId && kerning[1] === glyph.id) {
									width += kerning.amt*size;
									kernings[glyph.id] = kerning;
									break;
								}
							}
						}
						prevGlyphId = glyph.id;
						glyphs.push(glyph);
						width += glyph.xadv*size;
						break;
					}
				}
			}

			let offsetx = 0, offsety = 0;
			align = align.split('-');
			switch(align[0]) {
				case 'start': break;
				case 'center': offsetx = -width/2; break;
				case 'end': offsetx = -width; break;
			}
			switch(align[1]) {
				case 'start': break;
				case 'center': offsety = -height/2; break;
				case 'end': offsety = -height; break;
			}

			glyphs.forEach((glyph) => {
				if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

				if(kernings[glyph.id] !== undefined) pos[0] += kernings[glyph.id].amt*size;

				const start = this.vertexCount*exports.vertexStride;
				exports.vertices[start   ] = pos[0]+glyph.xoff*size+offsetx;
				exports.vertices[start+1 ] = pos[1]+glyph.yoff*size+offsety;
				exports.vertices[start+2 ] = 0;
				exports.vertices[start+3 ] = color[0];
				exports.vertices[start+4 ] = color[1];
				exports.vertices[start+5 ] = color[2];
				exports.vertices[start+6 ] = color[3];
				exports.vertices[start+7 ] = glyph.x/exports.fontData.common.scaleW;
				exports.vertices[start+8 ] = glyph.y/exports.fontData.common.scaleH;
				exports.vertices[start+9 ] = textureIndex;
				exports.vertices[start+10] = size;
				exports.vertices[start+11] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
				exports.vertices[start+12] = pos[1]+glyph.yoff*size+offsety;
				exports.vertices[start+13] = 0;
				exports.vertices[start+14] = color[0];
				exports.vertices[start+15] = color[1];
				exports.vertices[start+16] = color[2];
				exports.vertices[start+17] = color[3];
				exports.vertices[start+18] = (glyph.x+glyph.w)/exports.fontData.common.scaleW;
				exports.vertices[start+19] = glyph.y/exports.fontData.common.scaleH;
				exports.vertices[start+20] = textureIndex;
				exports.vertices[start+21] = size;
				exports.vertices[start+22] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
				exports.vertices[start+23] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
				exports.vertices[start+24] = 0;
				exports.vertices[start+25] = color[0];
				exports.vertices[start+26] = color[1];
				exports.vertices[start+27] = color[2];
				exports.vertices[start+28] = color[3];
				exports.vertices[start+29] = (glyph.x+glyph.w)/exports.fontData.common.scaleW;
				exports.vertices[start+30] = (glyph.y+glyph.h)/exports.fontData.common.scaleH;
				exports.vertices[start+31] = textureIndex;
				exports.vertices[start+32] = size;
				exports.vertices[start+33] = pos[0]+glyph.xoff*size+offsetx;
				exports.vertices[start+34] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
				exports.vertices[start+35] = 0;
				exports.vertices[start+36] = color[0];
				exports.vertices[start+37] = color[1];
				exports.vertices[start+38] = color[2];
				exports.vertices[start+39] = color[3];
				exports.vertices[start+40] = glyph.x/exports.fontData.common.scaleW;
				exports.vertices[start+41] = (glyph.y+glyph.h)/exports.fontData.common.scaleH;
				exports.vertices[start+42] = textureIndex;
				exports.vertices[start+43] = size;

				exports.indices[this.indexCount  ] = this.vertexCount;
				exports.indices[this.indexCount+1] = this.vertexCount+1;
				exports.indices[this.indexCount+2] = this.vertexCount+2;
				exports.indices[this.indexCount+3] = this.vertexCount+2;
				exports.indices[this.indexCount+4] = this.vertexCount+3;
				exports.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;

				pos[0] += glyph.xadv*size;
			});
		}

		flush() {
			exports.vertexBuffer.partialWrite(exports.vertices, this.vertexCount*exports.vertexStride);
			exports.indexBuffer.partialWrite(exports.indices, this.indexCount);
			exports.renderer.draw(this.indexCount);
			this.reset();
		}
	}

	exports.renderer = undefined;

	class Renderer{
		constructor() {
			exports.gl.blendFunc(exports.gl.SRC_ALPHA, exports.gl.ONE_MINUS_SRC_ALPHA);
			exports.gl.enable(exports.gl.BLEND);
			exports.gl.cullFace(exports.gl.FRONT);
			exports.gl.enable(exports.gl.CULL_FACE);

			Shader.init();
			exports.shader.bind();

			Batch.init();

			VertexArray.init();

			Camera.init();
		}

		static init() {
			exports.renderer = new Renderer();
		}

		clear(color) {
			exports.gl.clearColor(color[0], color[1], color[2], color[3]);
			exports.gl.clear(exports.gl.COLOR_BUFFER_BIT);
		}

		draw(indexCount) {
			exports.shader.bind();
			exports.vertexArray.bind();

			exports.gl.drawElements(exports.gl.TRIANGLES, indexCount, exports.gl.UNSIGNED_INT, 0);
		}

		delete() {
			Object.values(textures).forEach((texture) => { texture.delete(); });
			exports.shader.delete();
			exports.vertexArray.delete();
			exports.vertexBuffer.delete();
			exports.indexBuffer.delete();
		}
	}

	const version = "v0.3.33";
	exports.noUpdate = false;
	exports.deltaTime = 0;
	exports.accumulator = 0;
	let fixedUpdateFrequency = 50;
	exports.frames = 0;
	exports.prevTime = 0;
	const mousePos = [0, 0];
	exports.mouseIsPressed = false;
	const keysPressed = {};
	exports.canvas = undefined;
	//let mode = 'webgl2';
	exports.gl = undefined;

	function HBsetup() {
		console.log("Hummingbird "+version+" by SantaClausNL. https://www.santaclausnl.ga/");
		const loading = document.createElement('p');
		loading.innerText = "LOADING...";
		loading.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
		document.body.appendChild(loading);

		new HBMath();
		if(typeof setup === 'function') setup();

		Texture.init(loading);
	}

	function init(width, height, options) {
		if(options === undefined) options = {};
		if(options["noUpdate"] === true) exports.noUpdate = true;
		if(options["canvas"] === undefined) {
			exports.canvas = document.createElement("CANVAS"), exports.gl = exports.canvas.getContext('webgl2');
			if(options["parent"] === undefined) document.body.appendChild(exports.canvas); else options["parent"].appendChild(exports.canvas);
		} else exports.canvas = options["canvas"], exports.gl = exports.canvas.getContext('webgl2');

		// if(gl === null) {
		// 	canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
		// 	mode = 'webgl';
		// }

		// if(gl === null) {
		// 	canvas.getContext('webgl');
		// 	mode = 'webgl';
		// }

		if(exports.gl === null) {
			exports.canvas.parentNode.removeChild(exports.canvas);
			const p = document.createElement('p');
			p.innerText = 'WebGL2 is not supported on your browser or machine.';
			if(options["parent"] === undefined) document.body.appendChild(p); else options["parent"].appendChild(p);
		} else {
			exports.canvas.width = width || 100, exports.canvas.height = height || 100;
			exports.canvas.size = Vec2.new(exports.canvas.width, exports.canvas.height);
			exports.canvas.center = Vec2.new(exports.canvas.width/2, exports.canvas.height/2);
			exports.canvas.id = (options["id"] === undefined) ? "HummingbirdCanvas" : options["id"];

			Renderer.init();
		}

		window.addEventListener('keydown', (event) => {
			keysPressed[event.keyCode] = true;
			if(typeof keyPressed === 'function') keyPressed(event);
		});
		window.addEventListener('keyup', (event) => {
			keysPressed[event.keyCode] = false;
			if(typeof keyReleased === 'function') keyReleased(event);
		});
		window.addEventListener('mousemove', (event) => {
			const rect = exports.canvas.getBoundingClientRect();
			Vec2.set(mousePos,
				event.clientX-rect.left-document.body.scrollLeft,
				event.clientY-rect.top-document.body.scrollTop
			);
			if(typeof mouseMoved === 'function') mouseMoved(event);
		});
		window.addEventListener('mousedown', (event) => {
			exports.mouseIsPressed = true;
			if(typeof mousePressed === 'function') mousePressed(event);
		});
		window.addEventListener('mouseup', (event) => {
			exports.mouseIsPressed = false;
			if(typeof mouseReleased === 'function') mouseReleased(event);
		});
		if(typeof windowResized === 'function') {
			window.addEventListener('resize', (event) => {
				windowResized(event);
			});
		}
		// window.addEventListener('beforeunload', () => {
		// 	renderer.delete();
		// 	delete gl;
		// 	canvas.remove();
		// });
	}

	function resizeCanvas(width, height) {
		exports.canvas.width = width || 100, exports.canvas.height = height || 100;
		Vec2.set(exports.canvas.size, exports.canvas.width, exports.canvas.height);
		Vec2.set(exports.canvas.center, exports.canvas.width/2, exports.canvas.height/2);
		exports.gl.viewport(0, 0, exports.canvas.width, exports.canvas.height);
		Mat4.orthographic(exports.camera.projectionMatrix, 0, exports.canvas.width, 0, exports.canvas.height);
	}

	function HBupdate(now) {
		exports.deltaTime = now-exports.prevTime;
		exports.prevTime = now;

		exports.camera.setMVP();
		exports.batch.begin();

		if(typeof fixedUpdate === 'function') {
			exports.accumulator += exports.deltaTime;
			while(exports.accumulator >= 1000/fixedUpdateFrequency) {
				fixedUpdate();
				exports.accumulator -= 1000/fixedUpdateFrequency;
			}
		}

		update();

		exports.batch.end();
		exports.frames++;
		requestAnimationFrame(HBupdate);
	}

	window.addEventListener("load", HBsetup);

	exports.Batch = Batch;
	exports.Camera = Camera;
	exports.IndexBuffer = IndexBuffer;
	exports.Mat4 = Mat4;
	exports.Math = HBMath;
	exports.Noise = Noise;
	exports.Renderer = Renderer;
	exports.Shader = Shader;
	exports.Texture = Texture;
	exports.Vec2 = Vec2;
	exports.Vec3 = Vec3;
	exports.Vec4 = Vec4;
	exports.VertexArray = VertexArray;
	exports.VertexBuffer = VertexBuffer;
	exports.bytes = bytes;
	exports.fixedUpdateFrequency = fixedUpdateFrequency;
	exports.init = init;
	exports.keysPressed = keysPressed;
	exports.loadFile = loadFile;
	exports.maxIndexCount = maxIndexCount;
	exports.maxVertexCount = maxVertexCount;
	exports.mousePos = mousePos;
	exports.resizeCanvas = resizeCanvas;
	exports.setup = HBsetup;
	exports.textures = textures;
	exports.update = HBupdate;
	exports.version = version;

	return exports;

}({}));
