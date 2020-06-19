var HB = (function (exports) {
	'use strict';

	// import { canvas } from './common.js';

	function initMathObjects() {
		Vec2.init();
		Vec3.init();
		Vec4.init();
	}

	class HBMath{
		static radians(degrees) { // convert degrees to radians
			return degrees*(Math.PI/180);
		}
		static degrees(radians) { // convert radians to degrees
			return radians*(180/Math.PI);
		}
		static dist(x1, y1, x2, y2) { // gets distance between 2 x+y pairs
			return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
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
			return (
				Math.abs((vectorA.x+sizeA.x/2)-(vectorB.x+sizeB.x/2))*2 < (sizeA.x+sizeB.x)
			) && (
				Math.abs((vectorA.y+sizeA.y/2)-(vectorB.y+sizeB.y/2))*2 < (sizeA.y+sizeB.y)
			);
		}
		static rectCircleCollision(rectPos, rectSize, circleCenter, circleRadius) { // check for collision between a rectangle and a circle
			const dx = circleCenter.x-Math.max(rectPos.x, Math.min(circleCenter.x, rectPos.x+rectSize.x));
			const dy = circleCenter.y-Math.max(rectPos.y, Math.min(circleCenter.y, rectPos.y+rectSize.y));
			return (dx*dx + dy*dy) < circleRadius*circleRadius;
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
		static init() {
			Vec2.zero = {x: 0, y: 0};
			Vec2.one = {x: 1, y: 1};
		}

		static new(x = 0, y = 0) { return { x: x, y: y }; }
		static fromVec2(vector) { return { x: vector.x, y: vector.y }; }
		static fromAngle(angle, radius = 1) { return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }; }
		static copy(out, vector) { out.x = vector.x, out.y = vector.y; }
		static set(out, x, y) { out.x = x, out.y = y; }

		static add(out, x, y) { out.x += x, out.y += y; }
		static addVec2(out, vector) { out.x += vector.x, out.y += vector.y; }
		static addScalar(out, scalar) { out.x += scalar, out.y += scalar; }

		static subtract(out, x, y) { out.x -= x, out.y -= y; }
		static subtractVec2(out, vector) { out.x -= vector.x, out.y -= vector.y; }
		static subtractScalar(out, scalar) { out.x -= scalar, out.y -= scalar; }

		static multiply(out, x, y) { out.x *= x, out.y *= y; }
		static multiplyVec2(out, vector) { out.x *= vector.x, out.y *= vector.y; }
		static multiplyScalar(out, scalar) { out.x *= scalar, out.y *= scalar; }

		static divide(out, x, y) { out.x /= x, out.y /= y; }
		static divideVec2(out, vector) { out.x /= vector.x, out.y /= vector.y; }
		static divideScalar(out, scalar) { out.x /= scalar, out.y /= scalar; }

		static constrain(out, lowX, hiX, lowY, hiY) {
			out.x = HBMath.constrain(out.x, lowX, hiX);
			out.y = HBMath.constrain(out.y, lowY, hiY);
		}

		static angleBetweenVec2(vectorA, vectorB) {
			return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
		}

		static distBetweenVec2(vectorA, vectorB) {
			return Math.sqrt((vectorB.x-vectorA.x)*(vectorB.x-vectorA.x) + (vectorB.y-vectorA.y)*(vectorB.y-vectorA.y));
		}

		static collidesRect(vector, rectPos, rectSize) {
			return ((
				vector.x < rectPos.x+rectSize.x
			) && (
				vector.x > rectPos.x
			) && (
				vector.y < rectPos.y+rectSize.y
			) && (
				vector.y > rectPos.y
			));
		}
	}

	class Vec3{
		static init() {
			Vec3.zero = { x: 0, y: 0, z: 0 };
			Vec3.one = { x: 1, y: 1, z: 1 };
		}

		static new(x = 0, y = 0, z = 0) { return { x: x, y: y, z: z }; }
	}

	class Vec4{
		static init() {
			Vec4.zero = { x: 0, y: 0, z: 0, w: 0 };
			Vec4.one = { x: 1, y: 1, z: 1, w: 1 };

			Vec4.colors = {};
			Vec4.colors.white = { x: 1, y: 1, z: 1, w: 1 };
			Vec4.colors.black = { x: 0, y: 0, z: 0, w: 1 };
			Vec4.colors.red = { x: 1, y: 0, z: 0, w: 1 };
			Vec4.colors.green = { x: 0, y: 1, z: 0, w: 1 };
			Vec4.colors.blue = { x: 0, y: 0, z: 1, w: 1 };
			Vec4.colors.yellow = { x: 1, y: 1, z: 0, w: 1 };
			Vec4.colors.cyan = { x: 0, y: 1, z: 1, w: 1 };
			Vec4.colors.magenta = { x: 1, y: 0, z: 1, w: 1 };
		}

		static new(x = 0, y = 0, z = 0, w = 0) { return { x: x, y: y, z: z, w: w }; }
		static set(out, x, y, z, w) { out.x = x, out.y = y, out.z = z, out.w = w; }

		static multMat4(out, vector, matrix) {
			out.x = (vector.x * matrix.aa) + (vector.y * matrix.ba) + (vector.z * matrix.ca) + (vector.w * matrix.da);
			out.y = (vector.x * matrix.ab) + (vector.y * matrix.bb) + (vector.z * matrix.cb) + (vector.w * matrix.db);
			out.z = (vector.x * matrix.ac) + (vector.y * matrix.bc) + (vector.z * matrix.cc) + (vector.w * matrix.dc);
			out.w = (vector.x * matrix.ad) + (vector.y * matrix.bd) + (vector.z * matrix.cd) + (vector.w * matrix.dd);

			return out;
		}
	}

	class Mat4{
		static new(identity = 0) {
			return {
				aa: identity, ab: 0, ac: 0, ad: 0,
				ba: 0, bb: identity, bc: 0, bd: 0,
				ca: 0, cb: 0, cc: identity, cd: 0,
				da: 0, db: 0, dc: 0, dd: identity
			};
		}
		static copy(out, matrix) {
			out.aa = matrix.aa, out.ab = matrix.ab, out.ac = matrix.ac, out.ad = matrix.ad;
			out.ba = matrix.ba, out.bb = matrix.bb, out.bc = matrix.bc, out.bd = matrix.bd;
			out.ca = matrix.ca, out.cb = matrix.cb, out.cc = matrix.cc, out.cd = matrix.cd;
			out.da = matrix.da, out.db = matrix.db, out.dc = matrix.dc, out.dd = matrix.dd;

			return out;
		}
		static fromMat4(matrix) {
			return {
				aa: matrix.aa, ab: matrix.ab, ac: matrix.ac, ad: matrix.ad,
				ba: matrix.ba, bb: matrix.bb, bc: matrix.bc, bd: matrix.bd,
				ca: matrix.ca, cb: matrix.cb, cc: matrix.cc, cd: matrix.cd,
				da: matrix.da, db: matrix.db, dc: matrix.dc, dd: matrix.dd
			};
		}

		static transpose(out, matrix) {
			const temp = this.fromMat4(matrix);

			out.aa = temp.aa, out.ab = temp.ba, out.ac = temp.ca, out.ad = temp.da;
			out.ba = temp.ab, out.bb = temp.bb, out.bc = temp.cb, out.bd = temp.db;
			out.ca = temp.ac, out.cb = temp.bc, out.cc = temp.cc, out.cd = temp.dc;
			out.da = temp.ad, out.db = temp.bd, out.dc = temp.cd, out.dd = temp.dd;

			return out;
		}
		static toArray(matrix) {
			return [
				matrix.aa, matrix.ab, matrix.ac, matrix.ad,
				matrix.ba, matrix.bb, matrix.bc, matrix.bd,
				matrix.ca, matrix.cb, matrix.cc, matrix.cd,
				matrix.da, matrix.db, matrix.dc, matrix.dd
			];
		}

		static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
			const rl = right-left, tb = top-bottom, fn = far-near;

			out.aa = 2/rl, out.ab =    0, out.ac =     0, out.ad = -(right+left)/rl;
			out.ba =    0, out.bb = 2/tb, out.bc =     0, out.bd = -(top+bottom)/tb;
			out.ca =    0, out.cb =    0, out.cc = -2/fn, out.cd =   -(far+near)/fn;
			out.da =    0, out.db =    0, out.dc =     0, out.dd =                1;

			return out;
		}

		// static perspective(out, FoV = 60, aspect = canvas.width/canvas.height, near = 0.01, far = 1000) {
		// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * HBMath.radians(FoV));
		// 	const invRange = 1.0 / (near - far);

		// 	out.aa = f/aspect, out.ab =    0, out.ac =                   0, out.ad =  0;
		// 	out.ba =        0, out.bb =    f, out.bc =                   0, out.bd =  0;
		// 	out.ca =        0, out.cb =    0, out.cc = (near+far)*invRange, out.cd = -1;
		// 	out.da =        0, out.db =    0, out.dc = near*far*invRange*2, out.dd =  0;
		// }

		static multMat4(out, matrixA, matrixB) {
			out.aa = (matrixB.aa * matrixA.aa) + (matrixB.ab * matrixA.ba) + (matrixB.ac * matrixA.ca) + (matrixB.ad * matrixA.da);
			out.ab = (matrixB.aa * matrixA.ab) + (matrixB.ab * matrixA.bb) + (matrixB.ac * matrixA.cb) + (matrixB.ad * matrixA.db);
			out.ac = (matrixB.aa * matrixA.ac) + (matrixB.ab * matrixA.bc) + (matrixB.ac * matrixA.cc) + (matrixB.ad * matrixA.dc);
			out.ad = (matrixB.aa * matrixA.ad) + (matrixB.ab * matrixA.bd) + (matrixB.ac * matrixA.cd) + (matrixB.ad * matrixA.dd);

			out.ba = (matrixB.ba * matrixA.aa) + (matrixB.bb * matrixA.ba) + (matrixB.bc * matrixA.ca) + (matrixB.bd * matrixA.da);
			out.bb = (matrixB.ba * matrixA.ab) + (matrixB.bb * matrixA.bb) + (matrixB.bc * matrixA.cb) + (matrixB.bd * matrixA.db);
			out.bc = (matrixB.ba * matrixA.ac) + (matrixB.bb * matrixA.bc) + (matrixB.bc * matrixA.cc) + (matrixB.bd * matrixA.dc);
			out.bd = (matrixB.ba * matrixA.ad) + (matrixB.bb * matrixA.bd) + (matrixB.bc * matrixA.cd) + (matrixB.bd * matrixA.dd);

			out.ca = (matrixB.ca * matrixA.aa) + (matrixB.cb * matrixA.ba) + (matrixB.cc * matrixA.ca) + (matrixB.cd * matrixA.da);
			out.cb = (matrixB.ca * matrixA.ab) + (matrixB.cb * matrixA.bb) + (matrixB.cc * matrixA.cb) + (matrixB.cd * matrixA.db);
			out.cc = (matrixB.ca * matrixA.ac) + (matrixB.cb * matrixA.bc) + (matrixB.cc * matrixA.cc) + (matrixB.cd * matrixA.dc);
			out.cd = (matrixB.ca * matrixA.ad) + (matrixB.cb * matrixA.bd) + (matrixB.cc * matrixA.cd) + (matrixB.cd * matrixA.dd);

			out.da = (matrixB.da * matrixA.aa) + (matrixB.db * matrixA.ba) + (matrixB.dc * matrixA.ca) + (matrixB.dd * matrixA.da);
			out.db = (matrixB.da * matrixA.ab) + (matrixB.db * matrixA.bb) + (matrixB.dc * matrixA.cb) + (matrixB.dd * matrixA.db);
			out.dc = (matrixB.da * matrixA.ac) + (matrixB.db * matrixA.bc) + (matrixB.dc * matrixA.cc) + (matrixB.dd * matrixA.dc);
			out.dd = (matrixB.da * matrixA.ad) + (matrixB.db * matrixA.bd) + (matrixB.dc * matrixA.cd) + (matrixB.dd * matrixA.dd);

			return out;
		}

		static scale(out, matrix, scale) {
			return this.multMat4(out, matrix, {
				aa: scale, ab: 0, ac: 0, ad: 0,
				ba: 0, bb: scale, bc: 0, bd: 0,
				ca: 0, cb: 0, cc: scale, cd: 0,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
		static translate(out, matrix, vector3) {
			return this.multMat4(out, matrix, {
				aa: 1, ab: 0, ac: 0, ad: vector3.x,
				ba: 0, bb: 1, bc: 0, bd: vector3.y,
				ca: 0, cb: 0, cc: 1, cd: vector3.z,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
		static rotate(out, matrix, up, angle) {
			const sinAngle = Math.sin(angle/2);
			const x = up.x * sinAngle, y = up.y * sinAngle, z = up.z * sinAngle, w = Math.cos(angle/2);

			const x2 = x + x, y2 = y + y, z2 = z + z;

			const xx = x * x2;
			const yx = y * x2, yy = y * y2;
			const zx = z * x2, zy = z * y2, zz = z * z2;
			const wx = w * x2, wy = w * y2, wz = w * z2;

			return this.multMat4(out, matrix, {
				aa: 1-yy-zz, ab: yx+wz, ac: zx-wy, ad: 0,
				ba: yx-wz, bb: 1-xx-zz, bc: zy+wx, bd: 0,
				ca: zx+wy, cb: zy+wx, cc: 1-xx-yy, cd: 0,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
		static rotateX(out, matrix, angle) {
			return this.multMat4(out, matrix, {
				aa: 1, ab: 0, ac: 0, ad: 0,
				ba: 0, bb: Math.cos(-angle), bc: Math.sin(angle), bd: 0,
				ca: 0, cb: Math.sin(-angle), cc: Math.cos(-angle), cd: 0,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
		static rotateY(out, matrix, angle) {
			return this.multMat4(out, matrix, {
				aa: Math.cos(-angle), ab: 0, ac: Math.sin(-angle), ad: 0,
				ba: 0, bb: 1, bc: 0, bd: 0,
				ca: Math.sin(angle), cb: 0, cc: Math.cos(-angle), cd: 0,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
		static rotateZ(out, matrix, angle) {
			return this.multMat4(out, matrix, {
				aa: Math.cos(-angle), ab: Math.sin(angle), ac: 0, ad: 0,
				ba: Math.sin(-angle), bb: Math.cos(-angle), bc: 0, bd: 0,
				ca: 0, cb: 0, cc: 1, cd: 0,
				da: 0, db: 0, dc: 0, dd: 1
			});
		}
	}

	exports.shader = undefined;

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
			exports.gl.getExtension('OES_standard_derivatives');
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
		setUniformMatrix(type, name, matrix) {
			const glMatrix = Mat4.toArray(matrix);
			exports.gl['uniformMatrix'+Math.sqrt(glMatrix.length)+type+'v'](this.getUniformLocation(name), false, glMatrix);
		}

		bind() { exports.gl.useProgram(this.id); }
		unbind() { exports.gl.useProgram(null); }
		delete() {
			this.unbind();
			exports.gl.deleteProgram(this.id);
		}
	}

	exports.camera = undefined;

	class Camera{
		constructor() {
			exports.gl.viewport(0, 0, exports.canvas.width, exports.canvas.height);

			this.MVP = Mat4.new();
			this.projectionMatrix = Mat4.new();
			Mat4.orthographic(this.projectionMatrix, 0, exports.canvas.width, 0, exports.canvas.height, -1, 1);
			// Mat4.perspective(this.projectionMatrix);

			this.viewMatrix = Mat4.new(1);
			// this.modelMatrix = Mat4.new(1);
		}

		static init() {
			exports.camera = new Camera();
		}

		setMVP(mvp = undefined) {
			if(mvp === undefined) {
				// const modelView = Mat4.new(1);
				// Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
				Mat4.multMat4(this.MVP, this.viewMatrix, this.projectionMatrix);
				Mat4.transpose(this.MVP, this.MVP);
				exports.shader.setUniformMatrix('f', 'uMVP', this.MVP);
			} else {
				Mat4.transpose(mvp, mvp);
				exports.shader.setUniformMatrix('f', 'uMVP', mvp);
			}
		}

		translate(vector3) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
		zoom(amount) {
			Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-exports.canvas.center.x, -exports.canvas.center.y));
			Mat4.scale(this.viewMatrix, this.viewMatrix, 1+amount);
			Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(exports.canvas.center.x, exports.canvas.center.y));
		}
		rotate(angle) {
			Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-exports.canvas.center.x, -exports.canvas.center.y));
			Mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
			Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(exports.canvas.center.x, exports.canvas.center.y));
		}
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
	function loadFile(path, type = 'text', callback) {
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
			exports.indices = new Uint16Array(maxIndexCount);
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
			this.ext = exports.gl.getExtension('OES_vertex_array_object');
			this.id = this.ext.createVertexArrayOES();
			this.bind();

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
			exports.vertexArray.layout.add('aVertexPosition', exports.gl.FLOAT, 2);
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

		bind() { this.ext.bindVertexArrayOES(this.id); }
		unbind() { this.ext.bindVertexArrayOES(null); }
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
				if(exports.noUpdate === false) requestAnimationFrame(HBupdate);
			});
			exports.font = new Texture('Hummingbird_Font-Atlas', 'https://projects.santaclausnl.ga/Hummingbird/assets/arial.png');

			const circleSize = 1000;
			const circle = new Uint8Array(circleSize*circleSize*4);
			for(let x = 0; x < circleSize; x++) {
				for(let y = 0; y < circleSize; y++) {
					const index = (x*circleSize+y)*4;

					if(HBMath.dist(x, y, circleSize/2, circleSize/2) < circleSize/2) {
						circle[index  ] = 255;
						circle[index+1] = 255;
						circle[index+2] = 255;
						circle[index+3] = 255;
					} else {
						circle[index  ] = 0;
						circle[index+1] = 0;
						circle[index+2] = 0;
						circle[index+3] = 0;
					}
				}
			}
			new Texture('Hummingbird_Circle');
			textures.Hummingbird_Circle.bind();
			this.setTextureParameters(exports.gl.LINEAR, exports.gl.CLAMP_TO_EDGE);
			exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA, circleSize, circleSize, 0, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, circle);
			textures.Hummingbird_Circle.onLoadCallback();

			// const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
			const textureSamplers = [];
			for(let i = 0; i < 16; i++) { textureSamplers[i] = i; }
			exports.shader.setUniformArray('i', 'uTextureIds', textureSamplers);

			{ // set a blank texture on texture slot 0
				const blankTexture = exports.gl.createTexture();
				exports.gl.activeTexture(exports.gl.TEXTURE0);
				exports.gl.bindTexture(exports.gl.TEXTURE_2D, blankTexture);
				this.setTextureParameters(exports.gl.NEAREST, exports.gl.REPEAT);
				exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA, 1, 1, 0, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
			}
		}

		setErrorTexture() {
			const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
			Texture.setTextureParameters(exports.gl.NEAREST, exports.gl.REPEAT);
			exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA, 2, 2, 0, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, errorTexture);
		}

		createTexture(path) {
			this.bind();
			this.setErrorTexture();

			if(path === undefined) return;

			const image = new Image();
			image.onload = () => {
				this.bind();
				Texture.setTextureParameters(exports.gl.LINEAR, exports.gl.CLAMP_TO_EDGE);
				exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGBA, exports.gl.RGBA, exports.gl.UNSIGNED_BYTE, image);
				this.onLoadCallback();
			};
			image.src = path;
		}

		static setTextureParameters(filter, wrap) {
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
	const maxVertexCount = 4000;
	const maxIndexCount = 6000;

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

		drawColoredPoint(pos, size = 1, color) {
			this.pushQuad(pos.x-size/4, pos.y-size/4, size/2, size/2, 0, color);
		}

		drawColoredPolygon(points, color, center = 0) {
			for(let i = 0; i < points.length-1; i++) {
				if(i === center) continue;
				if((this.vertexCount + 3) >= maxVertexCount || (this.indexCount + 3) >= maxIndexCount) this.flush();

				const start = this.vertexCount*exports.vertexStride;
				exports.vertices[start   ] = points[center].x;
				exports.vertices[start+1 ] = points[center].y;
				exports.vertices[start+2 ] = color.x;
				exports.vertices[start+3 ] = color.y;
				exports.vertices[start+4 ] = color.z;
				exports.vertices[start+5 ] = color.w;
				exports.vertices[start+6 ] = 0;
				exports.vertices[start+7 ] = 1;
				exports.vertices[start+8 ] = 0;
				exports.vertices[start+9 ] = 0;

				exports.vertices[start+10] = points[i].x;
				exports.vertices[start+11] = points[i].y;
				exports.vertices[start+12] = color.x;
				exports.vertices[start+13] = color.y;
				exports.vertices[start+14] = color.z;
				exports.vertices[start+15] = color.w;
				exports.vertices[start+16] = 0.5;
				exports.vertices[start+17] = 0.5;
				exports.vertices[start+18] = 0;
				exports.vertices[start+19] = 0;

				exports.vertices[start+20] = points[i+1].x;
				exports.vertices[start+21] = points[i+1].y;
				exports.vertices[start+22] = color.x;
				exports.vertices[start+23] = color.y;
				exports.vertices[start+24] = color.z;
				exports.vertices[start+25] = color.w;
				exports.vertices[start+26] = 1;
				exports.vertices[start+27] = 1;
				exports.vertices[start+28] = 0;
				exports.vertices[start+29] = 0;

				exports.indices[this.indexCount  ] = this.vertexCount;
				exports.indices[this.indexCount+1] = this.vertexCount+1;
				exports.indices[this.indexCount+2] = this.vertexCount+2;

				this.vertexCount += 3, this.indexCount += 3;
			}
		}

		drawColoredRectangle(pos, size, color) {
			this.pushQuad(pos.x, pos.y, size.x, size.y, 0, color);
		}

		drawTexturedRectangle(pos, size, texture) {
			this.pushQuad(pos.x, pos.y, size.x, size.y, this.getTextureIndex(texture));
		}

		drawColoredRectangleWithRotation(pos, size, angle, color) {
			this.drawRectangleWithRotation(pos, size, angle, 0, color);
		}

		drawTexturedRectangleWithRotation(pos, size, angle, texture) {
			this.drawRectangleWithRotation(pos, size, angle, this.getTextureIndex(texture));
		}

		drawRectangleWithRotation(pos, size, angle, texture = 0, color = HB.Vec4.one) {
			angle = HB.Math.radians(angle);
			const cosX = size.x*-0.5*Math.cos(angle), cosY = size.y*-0.5*Math.cos(angle);
			const cosX1 = size.x*0.5*Math.cos(angle), cosY1 = size.y*0.5*Math.cos(angle);
			const sinX = size.x*-0.5*Math.sin(angle), sinY = size.y*-0.5*Math.sin(angle);
			const sinX1 = size.x*0.5*Math.sin(angle), sinY1 = size.y*0.5*Math.sin(angle);

			this.pushArbitraryQuad(
				cosX-sinY+pos.x+size.x/2, sinX+cosY+pos.y+size.y/2,
				cosX1-sinY+pos.x+size.x/2, sinX1+cosY+pos.y+size.y/2,
				cosX1-sinY1+pos.x+size.x/2, sinX1+cosY1+pos.y+size.y/2,
				cosX-sinY1+pos.x+size.x/2, sinX+cosY1+pos.y+size.y/2,
				texture, color
			);
		}

		drawColoredLine(vectorA, vectorB, thickness, color) {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
			const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
			const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

			this.pushArbitraryQuad(
				vectorA.x-angleA.x, vectorA.y-angleA.y,
				vectorA.x+angleA.x, vectorA.y+angleA.y,
				vectorB.x-angleB.x, vectorB.y-angleB.y,
				vectorB.x+angleB.x, vectorB.y+angleB.y,
				0, color
			);
		}

		drawColoredEllipse(pos, size, color) {
			this.pushQuad(pos.x, pos.y, size.x, size.y, this.getTextureIndex(textures.Hummingbird_Circle), color);
		}

		drawColoredText(string, pos, size = 12, align = 'start-start', color) {
			const glyphs = [], kernings = {};
			const scalar = size/exports.fontData.info.size;
			let width = 0;
			const height = exports.fontData.common.lineh*scalar;

			let prevKerns;
			for(let i = 0; i < string.length; i++) {
				const glyph = exports.fontData.chars[string[i]] || exports.fontData.chars['?'];
				width += glyph.xadv*scalar;
				glyphs.push(glyph);

				if(prevKerns !== undefined) {
					const kerning = prevKerns[glyph.id];
					if(kerning !== undefined) {
						width += kerning*scalar;
						kernings[glyph.id] = kerning;
					}
				}
				prevKerns = glyph.kerns;
			}

			let offsetx = 0, offsety = 0;
			const alignTo = align.split('-');
			switch(alignTo[0]) {
				case 'start': break;
				case 'center': offsetx = -width/2; break;
				case 'end': offsetx = -width; break;
			}
			switch(alignTo[1]) {
				case 'start': break;
				case 'center': offsety = -height/2; break;
				case 'end': offsety = -height; break;
			}

			let textureIndex = this.getTextureIndex(exports.font);
			for(let glyph of glyphs) {
				const kerning = kernings[glyph.id];
				if(kerning !== undefined) offsetx += kerning*scalar;

				this.pushQuad(
					pos.x+glyph.xoff*scalar+offsetx, pos.y+glyph.yoff*scalar+offsety,
					glyph.w*scalar, glyph.h*scalar,
					textureIndex, color, scalar,
					glyph.x/exports.fontData.common.scaleW, glyph.y/exports.fontData.common.scaleH,
					glyph.w/exports.fontData.common.scaleW, glyph.h/exports.fontData.common.scaleH
				);

				offsetx += glyph.xadv*scalar;
			}

			return width;
		}

		pushQuad(x, y, w, h, tex, col, textSize, sx, sy, sw, sh) {
			this.pushArbitraryQuad(
				x, y,
				x+w, y,
				x+w, y+h,
				x, y+h,
				tex, col, textSize,
				sx, sy,
				sw, sh
			);
		}

		pushArbitraryQuad(x0, y0, x1, y1, x2, y2, x3, y3, tex = 0, col = HB.Vec4.one, textSize = 0, sx = 0, sy = 0, sw = 1, sh = 1) {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			const start = this.vertexCount*exports.vertexStride;
			exports.vertices[start   ] = x0;
			exports.vertices[start+1 ] = y0;
			exports.vertices[start+2 ] = col.x;
			exports.vertices[start+3 ] = col.y;
			exports.vertices[start+4 ] = col.z;
			exports.vertices[start+5 ] = col.w;
			exports.vertices[start+6 ] = sx;
			exports.vertices[start+7 ] = sy;
			exports.vertices[start+8 ] = tex;
			exports.vertices[start+9 ] = textSize;

			exports.vertices[start+10] = x1;
			exports.vertices[start+11] = y1;
			exports.vertices[start+12] = col.x;
			exports.vertices[start+13] = col.y;
			exports.vertices[start+14] = col.z;
			exports.vertices[start+15] = col.w;
			exports.vertices[start+16] = sx+sw;
			exports.vertices[start+17] = sy;
			exports.vertices[start+18] = tex;
			exports.vertices[start+19] = textSize;

			exports.vertices[start+20] = x2;
			exports.vertices[start+21] = y2;
			exports.vertices[start+22] = col.x;
			exports.vertices[start+23] = col.y;
			exports.vertices[start+24] = col.z;
			exports.vertices[start+25] = col.w;
			exports.vertices[start+26] = sx+sw;
			exports.vertices[start+27] = sy+sh;
			exports.vertices[start+28] = tex;
			exports.vertices[start+29] = textSize;

			exports.vertices[start+30] = x3;
			exports.vertices[start+31] = y3;
			exports.vertices[start+32] = col.x;
			exports.vertices[start+33] = col.y;
			exports.vertices[start+34] = col.z;
			exports.vertices[start+35] = col.w;
			exports.vertices[start+36] = sx;
			exports.vertices[start+37] = sy+sh;
			exports.vertices[start+38] = tex;
			exports.vertices[start+39] = textSize;

			exports.indices[this.indexCount  ] = this.vertexCount;
			exports.indices[this.indexCount+1] = this.vertexCount+1;
			exports.indices[this.indexCount+2] = this.vertexCount+2;
			exports.indices[this.indexCount+3] = this.vertexCount+2;
			exports.indices[this.indexCount+4] = this.vertexCount+3;
			exports.indices[this.indexCount+5] = this.vertexCount;

			this.vertexCount += 4, this.indexCount += 6;
		}

		getTextureIndex(texture) {
			let textureIndex = this.textureCache[texture.name];
			if(textureIndex === undefined) {
				if((this.textureIndex + 1) >= 16) this.flush();
				this.textureCache[texture.name] = textureIndex = this.textureIndex;
				texture.bind(this.textureIndex++);
			}
			return textureIndex;
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

		clear(color = undefined) {
			if(color !== undefined) exports.gl.clearColor(color.x, color.y, color.z, color.w);
			exports.gl.clear(exports.gl.COLOR_BUFFER_BIT);
		}

		draw(indexCount) {
			exports.shader.bind();
			exports.vertexArray.bind();

			exports.gl.drawElements(exports.gl.TRIANGLES, indexCount, exports.gl.UNSIGNED_SHORT, 0);
		}

		delete() {
			Object.values(textures).forEach((texture) => { texture.delete(); });
			exports.shader.delete();
			exports.vertexArray.delete();
			exports.vertexBuffer.delete();
			exports.indexBuffer.delete();
		}
	}

	const version = "v0.5.17";
	exports.noUpdate = false;
	exports.deltaTime = 0;
	exports.accumulator = 0;
	let fixedUpdateFrequency = 50;
	exports.frames = 0;
	exports.prevTime = 0;
	const mousePos = { x: 0, y: 0 };
	exports.mouseIsPressed = false;
	const keysPressed = {};
	exports.canvas = undefined;
	exports.gl = undefined;

	function HBsetup() {
		console.log("Hummingbird "+version+" by SantaClausNL. https://www.santaclausnl.ga/");
		const loading = document.createElement('p');
		loading.innerText = "LOADING...";
		loading.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
		document.body.appendChild(loading);

		initMathObjects();
		if(typeof setup === 'function') setup();

		Texture.init(loading);
	}

	function init(width = 100, height = 100, options) {
		if(options === undefined) options = {};
		if(options.noUpdate === true) exports.noUpdate = true;
		if(options.canvas === undefined) {
			exports.canvas = document.createElement("CANVAS"), exports.gl = exports.canvas.getContext('webgl');
			if(options.parent === undefined) document.body.appendChild(exports.canvas); else options.parent.appendChild(exports.canvas);
		} else exports.canvas = options.canvas, exports.gl = exports.canvas.getContext('webgl');

		if(exports.gl === null) {
			exports.canvas.parentNode.removeChild(exports.canvas);
			const p = document.createElement('p');
			p.innerText = 'WebGL is not supported on your browser or machine.';
			if(options.parent === undefined) document.body.appendChild(p); else options.parent.appendChild(p);
		} else {
			exports.canvas.width = width, exports.canvas.height = height;
			exports.canvas.size = Vec2.new(exports.canvas.width, exports.canvas.height);
			exports.canvas.center = Vec2.new(exports.canvas.width/2, exports.canvas.height/2);
			exports.canvas.id = (options.id === undefined) ? "HummingbirdCanvas" : options.id;
			exports.canvas.setAttribute('alt', 'Hummingbird canvas element.');

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

	function resizeCanvas(width = 100, height = 100) {
		exports.canvas.width = width, exports.canvas.height = height;
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
				if(exports.deltaTime > 1000) {
					exports.accumulator = 0;
					exports.deltaTime = 1;
					fixedUpdate();
					break;
				}
				fixedUpdate();
				exports.accumulator -= 1000/fixedUpdateFrequency;
			}
		}

		if(typeof update === 'function') update();

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
	exports.initMathObjects = initMathObjects;
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
